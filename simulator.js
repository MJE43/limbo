let stats, distances, chart;
async function simulateBets() {
    let serverSeed = document.getElementById('serverSeed').value;
    let clientSeed = document.getElementById('clientSeed').value;
    let startNonce = parseInt(document.getElementById('startNonce').value, 10);
    let endNonce = parseInt(document.getElementById('endNonce').value, 10);
    let targetMultiplier = parseFloat(document.getElementById('targetMultiplier').value);
    let resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
  
    // Clear table
    resultsTable.innerHTML = '';
    stats = { count: 0, sum: 0, sumOfSquares: 0, values: [], lastNonce: startNonce };
    distances = [];

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
          let distanceCell = row.insertCell(2);
  
          nonceCell.innerHTML = nonce;
          resultCell.innerHTML = result.toFixed(2);
          distanceCell.innerHTML = nonce - stats.lastNonce;

          // Update stats
          stats.count++;
          stats.sum += result;
          stats.sumOfSquares += result * result;
          stats.values.push(result);
          distances.push(nonce - stats.lastNonce);
          stats.lastNonce = nonce;
        }
      }
  
      if (nonce <= endNonce) {
        batchStart += batchSize;
        setTimeout(processBatch, 0); // schedule next batch
      } else {
        displayStats();
      }
    }
  
    processBatch(); // start processing batches
}

function displayStats() {
    stats.values.sort((a, b) => a - b);
    const mean = stats.sum / stats.count;
    const median = stats.values[Math.floor(stats.count / 2)];
    const stdDev = Math.sqrt(stats.sumOfSquares / stats.count - mean * mean);
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
  
    document.getElementById('mean').textContent = mean.toFixed(2);
    document.getElementById('median').textContent = median.toFixed(2);
    document.getElementById('stdDev').textContent = stdDev.toFixed(2);
    document.getElementById('avgDist').textContent = avgDist.toFixed(2);
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
  