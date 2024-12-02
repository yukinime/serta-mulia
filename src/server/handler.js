const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData"); // Impor storeData

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  // Lakukan prediksi
  const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID(); // Buat ID unik
  const createdAt = new Date().toISOString(); // Ambil waktu sekarang

  // Data hasil prediksi
  const data = {
    id: id,
    result: label,
    explanation: explanation,
    suggestion: suggestion,
    confidenceScore: confidenceScore,
    createdAt: createdAt,
  };

  // Simpan data prediksi ke database atau penyimpanan lain menggunakan storeData
  await storeData(id, data); // Panggil storeData sebelum response

  // Kode respons
  const response = h.response({
    status: "success",
    message: confidenceScore > 99 ? "Model is predicted successfully." : "Model is predicted successfully but under threshold. Please use the correct picture",
    data,
  });
  response.code(201); // Set status code HTTP 201
  return response;
}

module.exports = postPredictHandler;
