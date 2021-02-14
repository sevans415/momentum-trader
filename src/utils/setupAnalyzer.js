import { timer, from } from "rxjs";
import { switchMap, tap, map } from "rxjs/operators";
import { secureFetch } from "./secureFetch";
import { process, decision } from "./processBook";

const CRYPTOS_TO_WATCH = [
  "BTC-USD",
  "ETH-USD",
  "LINK-USD",
  "LTC-USD",
  "BCH-USD",
  "MKR-USD",
  "DASH-USD",
  "EOS-USD",
  "ALGO-USD"
];

const SECS = 1000;

const HISTORIC_INTERVAL = 60 * SECS;
const BOOK_INTERVAL = 7 * SECS;

const historicDataUrl = productId => {
  return `/products/${productId}/stats`;
};

const bookDataUrl = productId => {
  return `/products/${productId}/book?level=2`;
};

// eslint-disable-next-line
const fetchSurgingTokens = async () => {
  const results = await Promise.all(
    CRYPTOS_TO_WATCH.map(productId =>
      secureFetch(historicDataUrl(productId)).then(res => res.json())
    )
  );
  console.log(results);
  return results
    .map(({ open, last }, idx) => {
      // if it's up at least 5%
      return last / open > 1.05 ? CRYPTOS_TO_WATCH[idx] : false;
    })
    .filter(asset => asset !== false);
};

const fetchBookForAssets = async assets => {
  const results = await Promise.all(
    assets.map(productId =>
      secureFetch(bookDataUrl(productId)).then(res => res.json())
    )
  );
  console.log(assets, results);

  // analyze book, invoke dyl's function
  return results
    .map(process)
    .filter(asset => asset !== undefined)
    .map((assetData, idx) =>
      decision(assetData) ? { ...assetData, name: assets[idx] } : undefined
    )
    .filter(asset => asset !== undefined);
};

export const initAnalysisProcess = updateUI => {
  // 1. every 60 seconds update what assets are surging
  timer(0, HISTORIC_INTERVAL)
    .pipe(switchMap(() => from(fetchSurgingTokens())))
    .pipe(
      tap(x => console.log("updating list to subscribe to", x)),
      switchMap(assets =>
        timer(0, BOOK_INTERVAL).pipe(
          switchMap(() => fetchBookForAssets(assets))
        )
      )
    )
    .subscribe(updateUI);
};
