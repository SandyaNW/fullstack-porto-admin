import { AuthPage } from "@refinedev/antd";
import { Form, Input, Button, Checkbox, Card, theme } from "antd";
import { useLogin } from "@refinedev/core";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      wrapperProps={{
        style: {
          background: "linear-gradient(45deg, #001529 0%, #004d40 100%)",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
      renderContent={(content: any, title: any) => {
        const { mutate: login, isPending } = useLogin();

        return (
          <Card
            bordered={false}
            style={{
              width: 400,
              backgroundColor: "rgba(0, 0, 0, 0.6)", // Transparan gelap
              border: "1px solid #333",
            }}
          >
            {/* Judul */}
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <h2
                style={{
                  color: "#1890ff",
                  fontWeight: 800,
                  margin: 0,
                  fontSize: 32,
                }}
              >
                My Portfolio
              </h2>
              <span style={{ fontSize: 14, color: "#ccc" }}>
                Admin Dashboard Panel
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "white", margin: 0 }}>
                Sign in to your account
              </h3>
            </div>

            <Form
              layout="vertical"
              initialValues={{
                email: "admin@admin.com",
                password: "123456",
              }}
              onFinish={(values) => login(values)}
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={<span style={{ color: "#ccc" }}>Email</span>}
                rules={[{ required: true, message: "Email wajib diisi" }]}
              >
                <Input
                  size="large"
                  placeholder="admin@admin.com"
                  style={{
                    backgroundColor: "#1f1f1f",
                    borderColor: "#434343",
                    color: "white",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ color: "#ccc" }}>Password</span>}
                rules={[{ required: true, message: "Password wajib diisi" }]}
              >
                {/* KOMPONEN PASSWORD DENGAN MATA */}
                <Input.Password
                  size="large"
                  placeholder="Password"
                  style={{
                    backgroundColor: "#1f1f1f",
                    borderColor: "#434343",
                    color: "white",
                  }}
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: "#ccc" }}>Remember me</Checkbox>
                </Form.Item>
              </div>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                block
                loading={isPending}
              >
                Sign in
              </Button>
            </Form>
          </Card>
        );
      }}
    />
  );
};