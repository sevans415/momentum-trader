const validateShape = bookData => {
  return bookData && Object.keys(bookData) && bookData.bids;
};

export const process = data => {
  if (!validateShape(data)) {
    return undefined;
  }
  // seems like bids and asks come sorted, so can probably condense below code

  let totalBidOrders = 0;
  let totalAskOrders = 0;
  let totalBidSize = 0;
  let totalAskSize = 0;
  let minAsk = Number.POSITIVE_INFINITY;
  let maxAsk = 0;
  let maxBid = 0;
  let minBid = Number.POSITIVE_INFINITY;

  for (let i = 0; i < data.bids.length; i++) {
    totalBidOrders += data.bids[i][2];
    totalBidSize += parseFloat(data.bids[i][1]);
    if (data.bids[i][0] > maxBid) {
      maxBid = parseFloat(data.bids[i][0]);
    }
    if (data.bids[i][0] < minBid) {
      minBid = parseFloat(data.bids[i][0]);
    }
  }

  for (let i = 0; i < data.asks.length; i++) {
    totalAskOrders += data.asks[i][2];
    totalAskSize += parseFloat(data.asks[i][1]);
    if (data.asks[i][0] < minAsk) {
      minAsk = parseFloat(data.asks[i][0]);
    }
    if (data.asks[i][0] > maxAsk) {
      maxAsk = parseFloat(data.asks[i][0]);
    }
  }

  // bid-ask spread
  let spread = minAsk - maxBid;

  // estimated price
  let mid = (minAsk + maxBid) / 2;

  // bid spread
  let bidSpread = mid - minBid;

  // ask spread
  let askSpread = maxAsk - mid;

  // weighted orders & size
  let totalBidOrdersWtd = 0;
  let totalAskOrdersWtd = 0;
  let totalBidSizeWtd = 0;
  let totalAskSizeWtd = 0;

  for (let i = 0; i < data.bids.length; i++) {
    let gap = mid - parseFloat(data.bids[i][0]);
    let wtd = 1 - (gap / bidSpread) ** 2;
    totalBidOrdersWtd += data.bids[i][2] * wtd;
    totalBidSizeWtd += parseFloat(data.bids[i][1]) * wtd;
  }

  for (let i = 0; i < data.asks.length; i++) {
    let gap = parseFloat(data.asks[i][0]) - mid;
    let wtd = 1 - (gap / askSpread) ** 2;
    totalAskOrdersWtd += data.asks[i][2] * wtd;
    totalAskSizeWtd += parseFloat(data.asks[i][1]) * wtd;
  }

  return {
    totalBidOrders,
    totalAskOrders,
    totalBidSize,
    totalAskSize,
    minAsk,
    maxBid,
    spread,
    totalBidOrdersWtd,
    totalAskOrdersWtd,
    totalBidSizeWtd,
    totalAskSizeWtd
  };
};

export const decision = bookSummary => {
  return bookSummary.totalBidSize / bookSummary.totalAskSize > 1.5;
};
