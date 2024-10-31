import { useState, useEffect } from "react";
import { Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../assets/css/table.css";
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Định nghĩa kiểu dữ liệu cho phòng
interface Room {
  _id: string;
  hotelId: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  imageUrls: string[];
  description: string;
  status: string;
  size: number;
  facilities: string[];
}

const BookingTable = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0); // Quản lý ảnh đang chọn

  // Lấy dữ liệu phòng từ API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/rooms`, {
          params: { hotelId },
        });

        if (Array.isArray(response.data)) {
          // Group rooms by type
          const roomsByType: Room[] = response.data.reduce(
            (acc, room: Room) => {
              const { type } = room;
              if (!acc[type]) {
                acc[type] = { ...room, count: 1 }; // Initialize with count 1
              } else {
                acc[type].count += 1; // Increment count
              }
              return acc;
            },
            {}
          );

          // Convert the grouped object into an array to make it compatible with the DataTable.
          const roomsGroupedByType = Object.values(roomsByType);

          setRooms(roomsGroupedByType);
        } else {
          console.error("Dữ liệu không hợp lệ:", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phòng:", error);
      }
    };

    if (hotelId) {
      fetchRooms();
    }
  }, [hotelId]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Availability</h1>
      <div className="container my-2 p-4 bg-light rounded">
        {rooms.length === 0 ? (
          <p className="text-center">This hotel has not available rooms.</p>
        ) : (
          <Table bordered hover responsive>
            <thead className="bg-blue-custom text-white">
              <tr>
                <th>Accommodation Type</th>
                <th>Number of guests</th>
                <th>Today's Price</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>
                    <button
                      className="text-decoration-none text-primary btn-link"
                      onClick={() => handleRoomClick(room)}
                      style={{ background: "none", border: "none", padding: 0 }}
                    >
                      {room.type} - {room.roomNumber}
                    </button>
                    <br />
                  </td>
                  <td className="text-left">
                    <span>👤 × {room.capacity}</span>
                  </td>
                  <td className="text-left">
                    <span>
                      <p className="mt-3">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(room.pricePerNight)}
                      </p>
                    </span>
                  </td>
                  <td className="text-center">
                    <Button
                      label="Detail"
                      className="custom-button"
                      onClick={() => handleRoomClick(room)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal hiển thị thông tin chi tiết */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedRoom?.type}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRoom && (
              <>
                {/* Hiển thị ảnh lớn */}
                <div className="text-center">
                  <img
                    src={selectedRoom.imageUrls[activeImageIndex]} // Hiển thị ảnh theo index hiện tại
                    alt={`Room Image ${activeImageIndex + 1}`}
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: "700px", objectFit: "cover" }}
                  />
                </div>

                {/* Hiển thị danh sách ảnh nhỏ bên dưới */}
                <div className="d-flex justify-content-center flex-wrap">
                  {selectedRoom.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Room Thumbnail ${index + 1}`}
                      className={`img-thumbnail m-1 ${
                        index === activeImageIndex
                          ? "border border-primary"
                          : ""
                      }`}
                      style={{
                        width: "80px",
                        height: "80px",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveImageIndex(index)} // Cập nhật ảnh lớn khi nhấn vào ảnh nhỏ
                    />
                  ))}
                </div>

                <div className="mt-3">
                  <p>
                    <strong>Room Size: </strong>
                    {selectedRoom?.size} m²
                  </p>
                  <br />
                  <p>
                    <strong>Description: </strong>
                    {selectedRoom?.description}
                  </p>
                  <br />
                  <p>
                    <strong>Facilities: </strong>
                  </p>
                  {/* Hiển thị danh sách Facilities với 2 cột */}
                  <div className="row">
                    {selectedRoom?.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="col-md-6 mb-2 d-flex align-items-center"
                      >
                        <i
                          className="pi pi-check"
                          style={{
                            color: "black",
                            fontSize: "10px",
                            marginRight: "5px",
                          }}
                        ></i>{" "}
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button label="Close" onClick={() => setShowModal(false)} />
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default BookingTable;
