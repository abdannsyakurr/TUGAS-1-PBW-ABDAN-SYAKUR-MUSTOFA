document.addEventListener("DOMContentLoaded", function () {

    // --- 1. LOGIC HALAMAN LOGIN (index.html) ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const alertBox = document.getElementById("alertMessage");

            const userFound = dataPengguna.find(u => u.email === email && u.password === password);

            if (userFound) {
                sessionStorage.setItem("userSession", JSON.stringify(userFound));
                window.location.href = "dashboard.html";
            } else {
                alertBox.innerText = "Email atau password yang Anda masukkan salah!";
                alertBox.style.display = "block";
            }
        });
    }

    // Modal Handling (Lupa Password & Daftar)
    window.openModal = function (modalId) {
        document.getElementById(modalId).style.display = "flex";
    };

    window.closeModal = function (modalId) {
        document.getElementById(modalId).style.display = "none";
    };

    // --- 2. LOGIC DASHBOARD (dashboard.html) ---
    const greetingElem = document.getElementById("greetingText");
    if (greetingElem) {
        const user = JSON.parse(sessionStorage.getItem("userSession")) || { nama: "Pengguna" };
        const hour = new Date().getHours();
        let timeGreeting = "pagi";

        if (hour >= 11 && hour < 15) {
            timeGreeting = "siang";
        } else if (hour >= 15 && hour < 18) {
            timeGreeting = "sore";
        } else if (hour >= 18 || hour < 4) {
            timeGreeting = "malam";
        }

        greetingElem.innerText = `Selamat ${timeGreeting}, ${user.nama}! (Role: ${user.role})`;
    }

    // --- 3. LOGIC TRACKING PENGIRIMAN (tracking.html) ---
    const btnCariDO = document.getElementById("btnCariDO");
    if (btnCariDO) {
        btnCariDO.addEventListener("click", function () {
            const inputDO = document.getElementById("inputDO").value.trim();
            const hasilTracking = document.getElementById("hasilTracking");
            const alertTracking = document.getElementById("alertTracking");

            if (dataTracking[inputDO]) {
                const item = dataTracking[inputDO];
                alertTracking.style.display = "none";
                
                let timelineHTML = "";
                item.perjalanan.forEach(p => {
                    timelineHTML += `<li><strong>[${p.waktu}]</strong>: ${p.keterangan}</li>`;
                });

                hasilTracking.innerHTML = `
                    <div style="background:#fff; padding: 1.5rem; border-radius:8px; margin-top:1rem;">
                        <h3>Detail Pengiriman DO: ${item.nomorDO}</h3>
                        <p><strong>Nama Mahasiswa:</strong> ${item.nama}</p>
                        <p><strong>Status Pengiriman:</strong> <span style="color:green; font-weight:bold;">${item.status}</span></p>
                        <p><strong>Ekspedisi:</strong> ${item.ekspedisi}</p>
                        <p><strong>Tanggal Kirim:</strong> ${item.tanggalKirim}</p>
                        <p><strong>Total Pembayaran:</strong> ${item.total}</p>
                        <h4 style="margin-top: 1rem;">Riwayat Perjalanan Paket:</h4>
                        <ul style="padding-left:1.2rem; margin-top:0.5rem;">${timelineHTML}</ul>
                    </div>
                `;
            } else {
                hasilTracking.innerHTML = "";
                alertTracking.innerText = "Nomor Delivery Order (DO) tidak ditemukan!";
                alertTracking.style.display = "block";
            }
        });
    }

    // --- 4. LOGIC INFORMASI STOK (stock.html) ---
    const tableStokBody = document.getElementById("tableStokBody");
    if (tableStokBody) {
        function renderTableStok() {
            tableStokBody.innerHTML = "";
            dataBahanAjar.forEach((item, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.kodeLokasi}</td>
                        <td>${item.kodeBarang}</td>
                        <td>${item.namaBarang}</td>
                        <td>${item.jenisBarang}</td>
                        <td>${item.edisi}</td>
                        <td>${item.stok}</td>
                    </tr>
                `;
                tableStokBody.innerHTML += row;
            });
        }

        renderTableStok();

        // Tambah Baris Stok Baru
        const formStok = document.getElementById("formTambahStok");
        if (formStok) {
            formStok.addEventListener("submit", function (e) {
                e.preventDefault();
                const newBarang = {
                    kodeLokasi: document.getElementById("kodeLokasi").value,
                    kodeBarang: document.getElementById("kodeBarang").value,
                    namaBarang: document.getElementById("namaBarang").value,
                    jenisBarang: document.getElementById("jenisBarang").value,
                    edisi: document.getElementById("edisi").value,
                    stok: parseInt(document.getElementById("stok").value),
                    cover: "https://via.placeholder.com/150"
                };

                dataBahanAjar.push(newBarang);
                renderTableStok();
                formStok.reset();
                closeModal("modalTambahStok");
            });
        }
    }
});