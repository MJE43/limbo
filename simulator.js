async function simulateBets() {
    let serverSeed = document.getElementById('serverSeed').value;
    let clientSeed = document.getElementById('clientSeed').value;
    let startNonce = parseInt(document.getElementById('startNonce').value, 10);
    let endNonce = parseInt(document.getElementById('endNonce').value, 10);
    let targetMultiplier = parseFloat(document.getElementById('targetMultiplier').value);
    let resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
  
    // Clear table
    resultsTable.innerHTML = '';
  
    let batchSize = 1000; // we can adjust this based on performance
    let nonce = startNonce;
    let batchStart = startNonce;
  
    async function processBatch() {
      for (; nonce < batchStart + batchSize && nonce <= endNonce; nonce++) {
        let result = await _simulateBet(serverSeed, clientSeed, nonce);
        if (result >= targetMultiplier) {
          let row = resultsTable.insertRow();
          let nonceCell = row.insertCell(0);
          let resultCell = row.insertCell(1);
  
          nonceCell.innerHTML = nonce;
          resultCell.innerHTML = result.toFixed(2);
        }
      }
  
      if (nonce <= endNonce) {
        batchStart += batchSize;
        setTimeout(processBatch, 0); // schedule next batch
      }
    }
  
    processBatch(); // start processing batches
  }
  
  async function _simulateBet(serverSeed, clientSeed, nonce) {
    const key = CryptoJS.enc.Utf8.parse(serverSeed);
    const message = CryptoJS.enc.Utf8.parse(`${clientSeed}:${nonce}:0`);
    const hmac = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(message, key));
    const buffer = new Uint8Array(hmac.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
  
    const floats = [];
    floats.push(buffer[0] / 256);
    floats.push(buffer[1] / (256 ** 2));
    floats.push(buffer[2] / (256 ** 3));
    floats.push(buffer[3] / (256 ** 4));
  
    const float = Math.floor((floats.reduce((a, b) => a + b, 0)) * 100000000);
    const result = 100000000 / (float + 1) * (1 - 0.01);
    const limboRoll = Math.floor(result * 100) / 100;
    return limboRoll;
  }
  