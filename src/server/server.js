require("dotenv").config(); // Memuat variabel lingkungan dari file .env

const Hapi = require("@hapi/hapi"); // Mengimpor Hapi framework
const routes = require("../server/routes"); // Mengimpor rute dari file routes
const loadModel = require("../services/loadModel"); // Mengimpor fungsi untuk memuat model
const InputError = require("../exceptions/InputError"); // Mengimpor class InputError

(async () => {
  // Membuat server Hapi dengan konfigurasi tertentu
  const server = Hapi.server({
    port: 3000, // Port yang digunakan oleh server
    host: "0.0.0.0", // Host tempat server berjalan
    routes: {
      cors: {
        origin: ["*"], // Mengizinkan semua domain untuk mengakses server
      },
    },
  });

  // Memuat model dan menyimpannya di dalam aplikasi server
  const model = await loadModel();
  server.app.model = model;

  // Menambahkan rute-rute dari file routes
  server.route(routes);

  // Menambahkan ekstensi untuk menangani respons sebelum dikirim ke klien
  server.ext("onPreResponse", function (request, h) {
    const response = request.response; // Mengambil respons dari request

    // Jika respons berupa InputError, kita buat respons baru
    if (response instanceof InputError) {
      // Membuat respons baru dengan status fail dan pesan error
      const newResponse = h.response({
        status: "fail",
        message: `${response.message} Silakan gunakan foto lain.`, // Menambahkan pesan kustom
      });

      // Memastikan status code adalah integer dan sesuai dengan yang diberikan oleh InputError
      newResponse.code(response.statusCode);
      return newResponse; // Mengembalikan respons yang sudah dimodifikasi
    }

    // Jika respons adalah boom (kesalahan internal Hapi), buat respons baru
    if (response.isBoom) {
      const newResponse = h.response({
        status: "fail",
        message: response.message, // Menggunakan pesan error dari respons
      });

      // Memastikan status code yang valid
      newResponse.code(response.output.statusCode); // Perbaikan: output.statusCode untuk memastikan statusCode yang benar
      return newResponse; // Mengembalikan respons baru
    }

    // Jika tidak ada kesalahan, lanjutkan alur respons seperti biasa
    return h.continue;
  });

  // Menyalakan server setelah semuanya siap
  await server.start();
  console.log(`Server start at: ${server.info.uri}`); // Menampilkan URI server yang aktif
})();
