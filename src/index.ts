import * as vcJoseCose from "./vc-jose-cose.js";
import * as vcDataIntegrity from "./vc-data-inegrity.js";

async function main() {
    console.log("=== VC Data Integrity===");
    await vcDataIntegrity.main();

    console.log("=== Securing VC using JOSE===");
    await vcJoseCose.main();
}

main()
