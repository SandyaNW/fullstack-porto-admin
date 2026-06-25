import { Edit } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const CertificateEdit = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl();
  const { id } = useParams();
  const [form] = Form.useForm();

  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get(`${apiUrl}/certificates`);
        const current = data.find((item: any) => item.id === Number(id));
        
        if (current) {
          form.setFieldsValue({
            title: current.title,
            issuer: current.issuer,
            issued_date: current.issued_date,
            credential_url: current.credential_url,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
    };

    if (id) fetchData();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("issuer", values.issuer);
      formData.append("issued_date", values.issued_date);
      if (values.credential_url) {
        formData.append("credential_url", values.credential_url);
      }

      await axiosInstance.patch(`${apiUrl}/certificates/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Sertifikat berhasil diupdate!");
      list("certificates");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal update sertifikat";
        message.error(msg);
      }
    }
  };

  return (
    <Edit title="Edit Certificate" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="Certificate Name" name="title" rules={[{ required: true, message: "Nama sertifikat wajib diisi" }]}>
          <Input placeholder="Contoh: AWS Certified Cloud Practitioner" />
        </Form.Item>

        <Form.Item label="Issuer (Penerbit)" name="issuer" rules={[{ required: true, message: "Penerbit wajib diisi" }]}>
          <Input placeholder="Contoh: Amazon Web Services" />
        </Form.Item>

        <Form.Item label="Issued Date" name="issued_date" rules={[{ required: true, message: "Tanggal terbit wajib diisi" }]}>
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Credential URL" name="credential_url">
          <Input placeholder="Contoh: https://aws.amazon.com/verify..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Update Certificate
        </Button>

      </Form>
    </Edit>
  );
};