import { useEffect, useState, useRef } from "react";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
// Not intended for use outside of a Codebox Live sandbox
import { CodeboxLive } from "@codeboxlive/extensions-core";
// In production, import AzureClient from "@fluidframework/azure-client"
import { CodeboxLiveHost } from "@codeboxlive/extensions-fluid";
import { LiveShareClient } from "@microsoft/live-share";
import Header from "./Header";

export default function App(): JSX.Element {
  const counterMapRef = useRef<SharedMap | undefined>();
  const initRef = useRef<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // Join container on app load
    async function start(): Promise<void> {
      // Initialize the CodeboxLiveClient so that this sandbox app can communicate
      // with the Codebox Live application using window post messages. This is used
      // to authenticate a Fluid container when testing this app in a sandbox.
      await CodeboxLive.initialize();

      // Define container schema
      const schema = {
        initialObjects: {
          counterMap: SharedMap,
        },
      };
      // Define container callback for when container is first created
      const onFirstInitialize = (container: IFluidContainer) => {
        // Setup any initial state here
      };
      const host = new CodeboxLiveHost();
      const client = new LiveShareClient(host);
      const results = await client.joinContainer(schema, onFirstInitialize);

      counterMapRef.current = results?.container.initialObjects
        .counterMap as SharedMap;
      // Listen for changes to the value
      counterMapRef.current!.on("valueChanged", () => {
        setCounterValue(counterMapRef.current!.get("count") ?? 0);
      });
      setStarted(true);
      // Set initial value
      setCounterValue(counterMapRef.current!.get("count") ?? 0);
    }
    start().catch((error: any) => console.error(error));
  });
  return (
    <div>
      {started && (
        <>
          <Header />
          <p>{"Click the button to iterate the counter"}</p>
          <button
            onClick={() => {
              counterMapRef.current!.set("count", counterValue + 1);
            }}
          >
            {"+1"}
          </button>
          <h2 style={{ color: "red" }}>{counterValue}</h2>
        </>
      )}
      {!started && <div>{"Loading..."}</div>}
    </div>
  );
}
