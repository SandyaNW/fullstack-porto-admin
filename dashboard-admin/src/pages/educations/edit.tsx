import { Edit } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const EducationEdit = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl();
  const { id } = useParams();
  const [form] = Form.useForm();

  // 1. Setup Axios
  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // 2. Ambil Data Lama
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kita ambil list lalu filter (karena backend main.py endpoint GET-nya return list)
        const { data } = await axiosInstance.get(`${apiUrl}/educations`);
        const current = data.find((item: any) => item.id === Number(id));
        
        if (current) {
          form.setFieldsValue({
            school_name: current.school_name,
            degree: current.degree,
            start_year: current.start_year,
            end_year: current.end_year,
            description: current.description,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 3. Simpan Perubahan
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

      await axiosInstance.patch(`${apiUrl}/educations/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Pendidikan berhasil diupdate!");
      list("educations");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal update pendidikan";
        message.error(msg);
      }
    }
  };

  return (
    <Edit title="Edit Education" saveButtonProps={{ hidden: true }}>
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
          Update Education
        </Button>

      </Form>
    </Edit>
  );
};