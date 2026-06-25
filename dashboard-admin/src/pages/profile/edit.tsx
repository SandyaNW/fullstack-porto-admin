import { useForm } from "@refinedev/antd";
import { Form, Input, Upload, Button, message, Image, Card, Typography, Space, Divider, Row, Col, Skeleton, Tag } from "antd";
import { 
    UploadOutlined, 
    UserOutlined, 
    GithubOutlined, 
    LinkedinOutlined, 
    EditOutlined, 
    SaveOutlined, 
    CloseOutlined,
    GlobalOutlined,
    IdcardOutlined, 
} from "@ant-design/icons";
import { useApiUrl } from "@refinedev/core";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const API_URL = "http://localhost:8000";

export const ProfileEdit = () => {
  const apiUrl = useApiUrl();

  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });

  const [form] = Form.useForm();
  
  // State untuk Mode: View vs Edit
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan data yang akan ditampilkan di View Mode
  const [profileData, setProfileData] = useState<any>(null);

  // 1. Fetch Data Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/profile`);
      setProfileData(data); // Simpan ke state View
      
      // Simpan ke Form juga (untuk persiapan Edit)
      form.setFieldsValue({
        full_name: data.full_name,
        job_title: data.job_title,
        bio: data.bio,
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
      });
    } catch (error) {
      message.error("Gagal mengambil data profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Handle Save
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", values.full_name);
      formData.append("bio", values.bio);
      if (values.job_title) { formData.append("job_title", values.job_title); }
      if (values.github_url) formData.append("github_url", values.github_url);
      if (values.linkedin_url) formData.append("linkedin_url", values.linkedin_url);

      if (values.avatar && typeof values.avatar !== "string" && values.avatar.length > 0) {
        formData.append("avatar", values.avatar[0].originFileObj);
      }

      const { data } = await axiosInstance.patch(`${apiUrl}/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileData(data); // Update data View Mode
      message.success("Profile berhasil diupdate!");
      setIsEditing(false); // KEMBALI KE VIEW MODE
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) window.location.href = "/login";
      else message.error("Gagal update profile");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER VIEW MODE (TAMPILAN CANTIK) ---
  const renderViewMode = () => (
    <div style={{ paddingBottom: 20 }}>
      
      {/* 1. BANNER BACKGROUND */}
      {/* Kita kasih gradasi warna biar modern */}
      <div 
        style={{ 
            height: 140, 
            background: "linear-gradient(90deg, #1890ff 0%, #001529 100%)", 
            borderRadius: "12px 12px 0 0",
            position: "relative"
        }}
      >
        {/* Hiasan opsional: kalau mau taruh tombol edit di atas banner */}
      </div>

      <div style={{ textAlign: "center", marginTop: -70 }}> {/* Negative margin biar foto naik ke atas */}
        
        {/* 2. AVATAR OVERLAPPING */}
        {profileData?.avatar ? (
          <Image
            width={160}
            height={160}
            src={`${API_URL}/${profileData.avatar}`}
            style={{ 
                borderRadius: "50%", 
                objectFit: "cover", 
                border: "5px solid #fff", // Border putih tebal biar kontras
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                backgroundColor: "#fff"
            }}
          />
        ) : (
          <div style={{ 
              width: 160, height: 160, 
              background: "#fff", borderRadius: "50%", 
              margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", 
              border: "5px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" 
          }}>
            <UserOutlined style={{ fontSize: 60, color: "#ccc" }} />
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "0 24px", marginTop: 16 }}>
        {/* Nama & Title */}
        <Title level={2} style={{ marginBottom: 4, fontWeight: 700 }}>
            {profileData?.full_name}
        </Title>
        
        <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px", borderRadius: 20, marginBottom: 24 }}>
            {profileData?.job_title || "Digital Creator"}
        </Tag>

        {/* Bio Section dengan Background tipis */}
        <div style={{ 
            background: "#f9f9f9", 
            padding: "20px", 
            borderRadius: 12, 
            maxWidth: 600, 
            margin: "0 auto 30px",
            border: "1px dashed #d9d9d9"
        }}>
            <Paragraph style={{ fontSize: 16, color: "#555", marginBottom: 0, fontStyle: "italic" }}>
                "{profileData?.bio || "Belum ada deskripsi diri."}"
            </Paragraph>
        </div>

        {/* 3. TOMBOL SOSMED BERWARNA */}
        <Space size="middle">
            {profileData?.github_url && (
                <Button 
                    type="primary" shape="round" size="large" icon={<GithubOutlined />} 
                    style={{ background: "#333", borderColor: "#333" }} // Warna Github
                    onClick={() => window.open(`https://${profileData.github_url.replace('https://','')}`, '_blank')}
                >
                    GitHub
                </Button>
            )}
            {profileData?.linkedin_url && (
                <Button 
                    type="primary" shape="round" size="large" icon={<LinkedinOutlined />} 
                    style={{ background: "#0077b5", borderColor: "#0077b5" }} // Warna LinkedIn
                    onClick={() => window.open(`https://${profileData.linkedin_url.replace('https://','')}`, '_blank')}
                >
                    LinkedIn
                </Button>
            )}
        </Space>
      </div>
    </div>
  );

  // --- RENDER EDIT MODE (FORM INPUT) ---
  const renderEditMode = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
            <Col span={24} style={{ textAlign: 'center', marginBottom: 20 }}>
                <Form.Item
                    name="avatar"
                    valuePropName="fileList"
                    getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                    getValueProps={(value) => ({ fileList: Array.isArray(value) ? value : [] })}
                >
                    <Upload beforeUpload={() => false} listType="picture-card" maxCount={1} showUploadList={{ showPreviewIcon: false }}>
                        <div style={{ marginTop: 8 }}>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Ganti Foto</div>
                        </div>
                    </Upload>
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>Disarankan rasio 1:1 (Kotak)</Text>
            </Col>

            <Col span={24}>
                <Form.Item label="Full Name" name="full_name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item label="Headline / Job Title" name="job_title" rules={[{ required: true }]}>
                    <Input prefix={<IdcardOutlined />} size="large" placeholder="Contoh: Frontend Developer" />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Bio / About Me" name="bio" rules={[{ required: true }]}>
                    <Input.TextArea rows={4} showCount maxLength={500} />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item label="GitHub URL" name="github_url">
                    <Input prefix={<GithubOutlined />} placeholder="github.com/username" />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item label="LinkedIn URL" name="linkedin_url">
                    <Input prefix={<LinkedinOutlined />} placeholder="linkedin.com/in/username" />
                </Form.Item>
            </Col>
        </Row>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save Changes
            </Button>
        </div>
    </Form>
  );

  if (loading && !profileData) {
      return <Card><Skeleton active avatar paragraph={{ rows: 4 }} /></Card>;
  }

  return (
    <Card 
        title={isEditing ? "Edit Profile" : "My Profile"} 
        extra={
            !isEditing && (
                <Button type="primary" ghost icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Edit Profile
                </Button>
            )
        }
        style={{ maxWidth: 800, margin: "20px auto", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
        {isEditing ? renderEditMode() : renderViewMode()}
    </Card>
  );
};