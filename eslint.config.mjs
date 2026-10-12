import nextVitals from "eslint-config-next/core-web-vitals";

const config = [...nextVitals, { ignores: ["src/generated/**", ".next/**", "coverage/**"] }];
export default config;
