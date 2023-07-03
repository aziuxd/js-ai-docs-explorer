export const onSocketEvent = (socket: any) => {
  socket.on("connection", () => {
    console.log("connected");
  });

  socket.on("hello", (data: any) => {
    console.log(data);
  });
};
