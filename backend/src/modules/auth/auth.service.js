const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('./user.repository');
const { cache } = require('../../config/redis');
const logger = require('../../utils/logger');
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} = require('../../utils/errors');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60; // 7 days in seconds

class AuthService {
  // ─── Token Generation ──────────────────────────────────────────────

  generateAccessToken(user, sessionId) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
  }

  generateRefreshToken(user, sessionId) {
    return jwt.sign(
      { sub: user.id, sessionId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_TTL }
    );
  }

  async generateTokenPair(user) {
    const sessionId = uuidv4();
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user, sessionId);

    // Store hashed refresh token in DB
    const tokenHash = await bcrypt.hash(refreshToken, 8);
    await userRepository.updateRefreshToken(user.id, tokenHash);

    // Cache session metadata in Redis
    await cache.set(
      `session:${sessionId}`,
      { userId: user.id, role: user.role, createdAt: new Date() },
      REFRESH_TOKEN_TTL_MS
    );

    return { accessToken, refreshToken, sessionId };
  }

  // ─── Registration ──────────────────────────────────────────────────

  async register({ firstName, lastName, email, password, role }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepository.create({ firstName, lastName, email, passwordHash, role });

    logger.info({ message: 'New user registered', userId: user.id, email: user.email });

    const tokens = await this.generateTokenPair(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ─── Login ─────────────────────────────────────────────────────────

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new AuthenticationError('Account has been deactivated');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    await userRepository.updateLastLogin(user.id);

    logger.info({ message: 'User logged in', userId: user.id });
    const tokens = await this.generateTokenPair(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ─── Token Refresh ─────────────────────────────────────────────────

  async refreshTokens(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }

    const user = await userRepository.findByEmail(
      (await userRepository.findById(decoded.sub))?.email
    );

    if (!user || !user.refresh_token_hash) {
      throw new AuthenticationError('Session expired, please login again');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!isValid) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Invalidate old session
    await cache.del(`session:${decoded.sessionId}`);

    const tokens = await this.generateTokenPair(user);
    return tokens;
  }

  // ─── Logout ────────────────────────────────────────────────────────

  async logout(userId, accessToken, sessionId) {
    // Blacklist the current access token
    const decoded = jwt.decode(accessToken);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await cache.set(`blacklist:${accessToken}`, true, ttl);
    }

    // Clear refresh token and session
    await Promise.all([
      userRepository.clearRefreshToken(userId),
      cache.del(`session:${sessionId}`),
      cache.invalidatePattern(`user:${userId}:*`),
    ]);

    logger.info({ message: 'User logged out', userId });
  }

  // ─── Password Change ───────────────────────────────────────────────

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId))?.email
    );

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await userRepository.updatePassword(userId, newHash);

    // Invalidate all sessions
    await cache.invalidatePattern(`session:*`);
    logger.info({ message: 'Password changed', userId });
  }

  // ─── Utilities ─────────────────────────────────────────────────────

  sanitizeUser(user) {
    const { password_hash, refresh_token_hash, ...safe } = user;
    return safe;
  }

  async getProfile(userId) {
    const cacheKey = `user:${userId}:profile`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    await cache.set(cacheKey, user, 300); // 5 min cache
    return user;
  }
}

module.exports = new AuthService();
