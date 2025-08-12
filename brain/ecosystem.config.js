module.exports = {
  apps: [
    {
      name: "brainrobot",
      script: "./src/server.ts",
      interpreter: "ts-node",
      watch: ["src"],
      ignore_watch: ["node_modules"],
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M"
    }
  ]
};
