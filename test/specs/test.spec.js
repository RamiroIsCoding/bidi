import { browser } from "@wdio/globals";

describe("WebDriver BiDi Example", () => {
  it("should capture console logs", async () => {
    // Enable console log domain
    await browser.sendCommand("Log.enable", {});

    browser.sessionStatus;
    //Listen for logs
    browser.on("log.entryAdded", (params) => {
      console.log("Console log:", params.text);
    });

    // Navigate to a page
    await browser.url("https://webdriver.io/");

    await browser.$("//a[contains(text(),'Get Started')]").click();

    await browser.pause(5000);

    // Trigger some console logs in the browser
    await browser.execute(() => console.log("This is a test log"));
  });

  it("should intercept network requests", async () => {
    // Subscribe to network events
    await browser.sendCommand("Log.enable", {
      events: ["network.beforeRequestSent"],
    });

    // Intercept network requests
    browser.on("network.beforeRequestSent", (params) => {
      console.log("Network request:", params.request.url);
    });

    // Navigate to a page to trigger network requests
    await browser.url("https://webdriver.io");
  });

  it("should execute JavaScript and return the result", async () => {
    // Execute a JavaScript snippet
    // const result = await browser.execute(() => {
    //   // Example: Calculate the sum of two numbers
    //   return 5 + 3;
    // });

    const result = await browser.sendCommand("Script.evaluate", {
      expression: `
              // Example: Calculate the sum of two numbers
              return 5 + 3;
            `,
      returnByValue: true,
    });

    // Log the result
    console.log("JavaScript execution result:", result);

    // Verify the result
    expect(result).toBe(8);
  });

  it("should modify DOM elements", async () => {
    // Navigate to a page
    await browser.url("https://example.com");

    // Modify the DOM: Change the text of the <h1> element
    const newText = "New Title for Example Domain";
    await browser.execute((text) => {
      document.querySelector("h1").textContent = text;
    }, newText);

    // Verify the change
    const result = await $("h1").getText();
    console.log("Modified DOM content:", result);

    expect(result).toBe(newText);
  });
  it("should modify DOM elements BIDI", async () => {
    // Navigate to a page
    await browser.url("https://example.com");

    // Get the <h1> element's node ID
    const response = await browser.sendCommand("DOM.getDocument", {});
    const nodeId = response.root.nodeId;
    const h1NodeId = await browser.sendCommand("DOM.querySelector", {
      nodeId: nodeId,
      selector: "h1",
    });

    // Modify the DOM: Change the text of the <h1> element
    const newText = "New Title for Example Domain";
    await browser.sendCommand("DOM.setNodeValue", {
      nodeId: h1NodeId.nodeId,
      value: newText,
    });

    // Verify the change
    const result = await $("h1").getText();
    console.log("Modified DOM content:", result);

    expect(result).toBe(newText);
  });

  it("should monitor performance", async () => {
    // Enable the DOM domain
    await browser.sendCommand("DOM.enable", {});
    // Subscribe to performance events
    await browser.sendCommand("Performance.enable", {});

    // Listen for performance metrics
    browser.on("Performance.metrics", (params) => {
      console.log("Performance metrics:", params.metrics);

      // Example: Verify the FPS (Frames Per Second)
      expect(params.metrics.framesMean).toBeGreaterThan(30);
    });

    // Navigate to a page to trigger events
    await browser.url("https://webdriver.io/");

    await browser.$("//a[contains(text(),'Get Started')]").click();

    await browser.pause(5000);

    // Disable the Performance domain
    await browser.sendCommand("Performance.disable", {});
  });
});
