import { Create } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";

export const ExperienceCreate = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl(); // Pakai hook ini biar konsisten sama ProjectCreate
  const [form] = Form.useForm();

  // 1. Setup Axios Instance dengan Token Interceptor
  // (Supaya token terkirim otomatis & aman)
  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("company_name", values.company_name);
      formData.append("role", values.role);
      formData.append("start_year", values.start_year);
      formData.append("end_year", values.end_year);
      // Handle optional description
      if (values.description) {
        formData.append("description", values.description);
      }

      // 2. Kirim Request Pakai axiosInstance (Bukan axios biasa)
      await axiosInstance.post(`${apiUrl}/experiences`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Experience berhasil dibuat!");
      list("experiences");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      // 3. Logic Error Handling (Validasi Auth)
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login"; // Tendang ke login
      } else {
        // Tampilkan pesan error spesifik dari backend jika ada
        const msg = error.response?.data?.detail || "Gagal membuat experience";
        message.error(msg);
      }
    }
  };

  return (
    <Create title="Create New Experience" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="Company" name="company_name" rules={[{ required: true, message: "Nama perusahaan wajib diisi" }]}>
          <Input placeholder="Contoh: Google Indonesia" />
        </Form.Item>

        <Form.Item label="Role" name="role" rules={[{ required: true, message: "Posisi wajib diisi" }]}>
          <Input placeholder="Contoh: Frontend Developer" />
        </Form.Item>

        <Form.Item label="Start Year" name="start_year" rules={[{ required: true, message: "Tahun mulai wajib diisi" }]}>
          <Input placeholder="Contoh: 2021" />
        </Form.Item>

        <Form.Item label="End Year" name="end_year" rules={[{ required: true, message: "Tahun selesai wajib diisi" }]}>
          <Input placeholder="Contoh: 2023" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Deskripsi pekerjaan (opsional)" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Experience
        </Button>

      </Form>
    </Create>
  );
};