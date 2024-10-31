import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock, faHotel } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  phone: number;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const { showToast } = useAppContext();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutation(apiClient.register, {
    onSuccess: async (res) => {
      showToast({ message: res?.message, type: "SUCCESS" });
      // await queryClient.invalidateQueries("validateToken"); => Không validate token sau khi register nữa, chỉ có /login
      // navigate("/login");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { message?: string; errorData?: string }).message ||
        (error as { errorData?: string }).errorData ||
        "An unknown error occurred"; // Giá trị mặc định

      showToast({ message: errorMessage, type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    mutation.mutate(data);
  });

  return (
    <Container fluid className="bg-light min-vh-100 py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-blue-700 text-white text-center border-0 pt-4">
              <div className="mb-3">
                <FontAwesomeIcon icon={faHotel} size="3x" />
              </div>
              <h2 className="fw-bold">Create your account</h2>
              <p className="opacity-75">Join us to access exclusive hotel deals and manage your bookings</p>
            </Card.Header>

            <Card.Body className="px-4 py-4">
              <Form onSubmit={onSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">First Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FontAwesomeIcon icon={faUser} className="text-blue-700" />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="John"
                          {...register("firstName", { required: "This field is required" })}
                          isInvalid={!!errors.firstName}
                          className="border-2 text-blue-100"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Last Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FontAwesomeIcon icon={faUser} className="text-blue-700" />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Doe"
                          {...register("lastName", { required: "This field is required" })}
                          isInvalid={!!errors.lastName}
                          className="border-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FontAwesomeIcon icon={faEnvelope} className="text-blue-700" />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          {...register("email", { required: "This field is required" })}
                          isInvalid={!!errors.email}
                          className="border-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Phone</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FontAwesomeIcon icon={faPhone} className="text-blue-700" />
                        </span>
                        <Form.Control
                          type="tel"
                          placeholder="+84 000 000 000"
                          {...register("phone", { required: "This field is required" })}
                          isInvalid={!!errors.phone}
                          className="border-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FontAwesomeIcon icon={faLock} className="text-blue-700" />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      {...register("password", {
                        required: "This field is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      isInvalid={!!errors.password}
                      className="border-2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FontAwesomeIcon icon={faLock} className="text-blue-700" />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        validate: (val) => {
                          if (!val) {
                            return "This field is required";
                          } else if (watch("password") !== val) {
                            return "Your passwords do no match";
                          }
                        },
                      })}
                      isInvalid={!!errors.confirmPassword}
                      className="border-2 "
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword?.message}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Alert variant="info" className="mb-4 border-2 bg-blue-100">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </Alert>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary"
                    size="lg"
                    type="submit"
                    className="mb-3 fw-bold py-3 text-white border-0 bg-blue-700"
                    style={{
                      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    Create Account
                  </Button>
                </div>

                <p className="text-center text-muted mb-0">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-700 text-decoration-none fw-bold">
                    Sign in
                  </a>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;