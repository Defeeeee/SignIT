module.exports = {
  apps: [
    {
      name: "signit",
      cwd: "/home/ubuntu/signit",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "8711",
      },
    },
  ],
};
