import { Create } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";

export const EducationCreate = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl();
  const [form] = Form.useForm();

  // 1. Setup Axios (Token Interceptor)
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
      formData.append("school_name", values.school_name);
      formData.append("degree", values.degree);
      formData.append("start_year", values.start_year);
      formData.append("end_year", values.end_year);
      if (values.description) {
        formData.append("description", values.description);
      }

      // 2. Kirim Request
      await axiosInstance.post(`${apiUrl}/educations`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Pendidikan berhasil ditambahkan!");
      list("educations");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      // 3. Error Handling (Auth)
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal menambah pendidikan";
        message.error(msg);
      }
    }
  };

  return (
    <Create title="Add Education" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="School / University" name="school_name" rules={[{ required: true, message: "Nama sekolah wajib diisi" }]}>
          <Input placeholder="Contoh: Universitas Indonesia" />
        </Form.Item>

        <Form.Item label="Degree / Major" name="degree" rules={[{ required: true, message: "Jurusan/Gelar wajib diisi" }]}>
          <Input placeholder="Contoh: Sarjana Komputer" />
        </Form.Item>

        <Form.Item label="Start Year" name="start_year" rules={[{ required: true, message: "Tahun mulai wajib diisi" }]}>
          <Input placeholder="Contoh: 2019" />
        </Form.Item>

        <Form.Item label="End Year" name="end_year" rules={[{ required: true, message: "Tahun lulus wajib diisi" }]}>
          <Input placeholder="Contoh: 2023" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Deskripsi tambahan (opsional)" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Education
        </Button>

      </Form>
    </Create>
  );
};