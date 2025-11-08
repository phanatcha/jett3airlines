import { BaseModel } from './BaseModel';
import { Client, CreateClient, UpdateClient, ClientRegistrationRequest, ClientLoginRequest } from '../types/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Type declarations for Node.js globals (fallback if @types/node is not available)
declare const process: {
  env: { [key: string]: string | undefined };
};
declare const Buffer: {
  from(str: string, encoding?: string): any;
};

export class ClientModel extends BaseModel {
  constructor() {
    super('client');
  }

  // Find client by ID
  async findClientById(clientId: number): Promise<Client | null> {
    return await super.findById<Client>(clientId, 'client_id');
  }

  // Find client by username
  async findByUsername(username: string): Promise<Client | null> {
    try {
      const query = 'SELECT * FROM client WHERE username = ? LIMIT 1';
      const results = await this.executeQuery<Client>(query, [username]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding client by username:', error);
      throw error;
    }
  }

  // Find client by email
  async findByEmail(email: string): Promise<Client | null> {
    try {
      const query = 'SELECT * FROM client WHERE email = ? LIMIT 1';
      const results = await this.executeQuery<Client>(query, [email]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding client by email:', error);
      throw error;
    }
  }

  // Create new client with encrypted password and card number
  async createClient(clientData: ClientRegistrationRequest): Promise<number> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(clientData.password, 12);
      
      // Encrypt card number
      const encryptedCardNo = this.encryptCardNumber(clientData.card_no);

      const createData: CreateClient = {
        username: clientData.username,
        password: Buffer.from(hashedPassword, 'utf8'),
        email: clientData.email,
        phone_no: clientData.phone_no,
        firstname: clientData.firstname,
        lastname: clientData.lastname,
        dob: new Date(clientData.dob),
        street: clientData.street,
        city: clientData.city,
        province: clientData.province,
        Country: clientData.country, // Note: Capital C to match database
        postalcode: clientData.postalcode,
        card_no: encryptedCardNo,
        four_digit: clientData.four_digit,
        payment_type: clientData.payment_type
      };

      return await this.create(createData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Validate client login credentials
  async validateLogin(loginData: ClientLoginRequest): Promise<Client | null> {
    try {
      const client = await this.findByUsername(loginData.username);
      if (!client) {
        return null;
      }

      // Convert Buffer to string for password comparison
      const storedPassword = client.password.toString('utf8');
      const isValidPassword = await bcrypt.compare(loginData.password, storedPassword);
      
      if (!isValidPassword) {
        return null;
      }

      return client;
    } catch (error) {
      console.error('Error validating login:', error);
      throw error;
    }
  }

  // Update client information
  async updateClient(clientId: number, updateData: UpdateClient): Promise<boolean> {
    try {
      // If password is being updated, hash it
      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password.toString(), 12);
        updateData.password = Buffer.from(hashedPassword, 'utf8');
      }

      // If card number is being updated, encrypt it
      if (updateData.card_no && typeof updateData.card_no === 'string') {
        updateData.card_no = this.encryptCardNumber(updateData.card_no);
      }

      return await this.update<Client>(clientId, updateData, 'client_id');
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(clientId: number): Promise<boolean> {
    return await this.delete(clientId, 'client_id');
  }

  // Check if username exists
  async usernameExists(username: string): Promise<boolean> {
    try {
      const client = await this.findByUsername(username);
      return client !== null;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw error;
    }
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    try {
      const client = await this.findByEmail(email);
      return client !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  // Get client profile (without sensitive data)
  async getClientProfile(clientId: number): Promise<Omit<Client, 'password' | 'card_no'> | null> {
    try {
      const client = await this.findClientById(clientId);
      if (!client) {
        return null;
      }

      // Remove sensitive fields
      const { password, card_no, ...profile } = client;
      return profile;
    } catch (error) {
      console.error('Error getting client profile:', error);
      throw error;
    }
  }

  // Get all clients (admin function)
  async getAllClients(limit?: number, offset?: number): Promise<Client[]> {
    return await this.findAll<Client>({}, limit, offset, 'created_date DESC');
  }

  // Private method to encrypt card number
  private encryptCardNumber(cardNumber: string): any {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV and encrypted data
      const combined = iv.toString('hex') + ':' + encrypted;
      return Buffer.from(combined, 'utf8');
    } catch (error) {
      console.error('Error encrypting card number:', error);
      throw error;
    }
  }

  // Private method to decrypt card number (for admin purposes)
  private decryptCardNumber(encryptedCardNumber: any): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      
      // Extract IV and encrypted data
      const combined = encryptedCardNumber.toString('utf8');
      const parts = combined.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting card number:', error);
      throw error;
    }
  }

  // Validate client data
  validateClientData(clientData: ClientRegistrationRequest): string[] {
    const errors: string[] = [];

    if (!clientData.username || clientData.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!clientData.password || clientData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!clientData.email || !this.isValidEmail(clientData.email)) {
      errors.push('Valid email address is required');
    }

    if (!clientData.firstname || clientData.firstname.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!clientData.lastname || clientData.lastname.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!clientData.dob || !this.isValidDate(clientData.dob)) {
      errors.push('Valid date of birth is required');
    }

    if (!clientData.card_no || clientData.card_no.length < 13) {
      errors.push('Valid card number is required');
    }

    if (!clientData.four_digit || !/^\d{4}$/.test(clientData.four_digit)) {
      errors.push('Four digit code must be exactly 4 digits');
    }

    return errors;
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to validate date format
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}