import { Edit } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import { useApiUrl, useNavigation } from "@refinedev/core";
import axios from "axios";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const ExperienceEdit = () => {
  const apiUrl = useApiUrl();
  const { list } = useNavigation();
  const { id } = useParams();
  const [form] = Form.useForm();

  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const fetchData = async () => {
        const { data } = await axiosInstance.get(`${apiUrl}/experiences`);
        const current = data.find((item: any) => item.id === Number(id));
        if(current) form.setFieldsValue(current);
    };
    if(id) fetchData();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("company_name", values.company_name);
      formData.append("role", values.role);
      formData.append("start_year", values.start_year);
      formData.append("end_year", values.end_year);
      if (values.description) formData.append("description", values.description);

      await axiosInstance.patch(`${apiUrl}/experiences/${id}`, formData);
      message.success("Pekerjaan berhasil diupdate!");
      list("experiences");
    } catch (error: any) {
        if (error.response?.status === 401) window.location.href = "/login";
        else message.error("Gagal update pekerjaan");
    }
  };

  return (
    <Edit title="Edit Experience" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Company Name" name="company_name" rules={[{ required: true }]}> <Input /> </Form.Item>
        <Form.Item label="Role / Position" name="role" rules={[{ required: true }]}> <Input /> </Form.Item>
        <Form.Item label="Start Year" name="start_year" rules={[{ required: true }]}> <Input /> </Form.Item>
        <Form.Item label="End Year" name="end_year" rules={[{ required: true }]}> <Input /> </Form.Item>
        <Form.Item label="Description" name="description"> <Input.TextArea rows={3} /> </Form.Item>
        <Button type="primary" htmlType="submit" block size="large">Update Experience</Button>
      </Form>
    </Edit>
  );
};