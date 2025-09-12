import api from "./api";

const PORT = 8088;

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
