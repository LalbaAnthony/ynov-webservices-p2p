import Peer, { DataConnection } from 'peerjs';
import { PeerMessage } from './types';

export class PeerManager {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private onMessageCallback: ((message: PeerMessage) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onDisconnectedCallback: (() => void) | null = null;

  async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      const roomId = this.generateRoomId();

      this.peer = new Peer(roomId);

      this.peer.on('open', (id) => {
        console.log('Room créée avec l\'ID:', id);
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        console.log('Quelqu\'un rejoint la room');
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Erreur Peer:', err);
        reject(err);
      });
    });
  }

  async joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', () => {
        console.log('Connexion au serveur PeerJS établie');

        const conn = this.peer!.connect(roomId, {
          reliable: true,
        });

        conn.on('open', () => {
          console.log('Connecté à la room:', roomId);
          this.setupConnection(conn);
          resolve();
        });

        conn.on('error', (err) => {
          console.error('Erreur de connexion:', err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Erreur Peer:', err);
        reject(err);
      });
    });
  }

  private setupConnection(conn: DataConnection): void {
    this.connection = conn;

    conn.on('data', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data as PeerMessage);
      }
    });

    conn.on('open', () => {
      if (this.onConnectedCallback) {
        this.onConnectedCallback();
      }
    });

    conn.on('close', () => {
      console.log('Connexion fermée');
      if (this.onDisconnectedCallback) {
        this.onDisconnectedCallback();
      }
    });

    conn.on('error', (err) => {
      console.error('Erreur de connexion:', err);
    });
  }

  sendMessage(message: PeerMessage): void {
    if (this.connection && this.connection.open) {
      this.connection.send(message);
    } else {
      console.error('Aucune connexion active');
    }
  }

  onMessage(callback: (message: PeerMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  destroy(): void {
    if (this.connection) {
      this.connection.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.connection = null;
    this.peer = null;
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  isConnected(): boolean {
    return this.connection !== null && this.connection.open;
  }
}
