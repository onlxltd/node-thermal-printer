const Net = require('net');
const Interface = require('./interface');

class Network extends Interface {
  constructor(host, port, options) {
    super();
    options = options || {};
    this.timeout = options.timeout || 3000;
    this.host = host;
    this.port = port || 9100;
  }

  async isPrinterConnected() {
    return new Promise((resolve) => {
      const networkConnection = Net.connect(
        {
          host: this.host,
          port: this.port,
          timeout: this.timeout,
        },
        () => {
          resolve(true);
          networkConnection.destroy();
        },
      );

      networkConnection.on('error', (error) => {
        resolve(false);
        networkConnection.destroy();
      });

      networkConnection.on('timeout', () => {
        resolve(false);
        networkConnection.destroy();
      });
    });
  }

  async execute(buffer, options = { waitForResponse }) {
    return new Promise((resolve, reject) => {
      const name = `${this.host}:${this.port}`;
      const networkConnection = Net.connect(
        {
          host: this.host,
          port: this.port,
          timeout: this.timeout,
        },
        () => {
          networkConnection.write(buffer, null, () => {
            if (!options.waitForResponse) {
              networkConnection.destroy();
              resolve();
            }
          });
        }
      );

      networkConnection.on('data', function (data) {
        if (options.waitForResponse) {
          resolve(data);
          networkConnection.destroy();
        }
      });

      networkConnection.on('error', (error) => {
        reject(error);
        networkConnection.destroy();
      });

      networkConnection.on('timeout', () => {
        reject(new Error('Socket timeout'));
        networkConnection.destroy();
      });
    });
  }
}

module.exports = Network;
