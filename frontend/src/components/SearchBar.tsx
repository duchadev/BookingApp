import { FormEvent, useEffect, useState } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { Search, Eraser   } from 'lucide-react';
const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();

  const [destination, setDestination] = useState<string>(search.destination);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Kiểm tra giá trị của adultCount và childCount
    console.log("Adult Count:", adultCount);
    console.log("Child Count:", childCount);

    search.saveSearchValues(
      0, // Giá mặc định cho pricePerNight
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );

    navigate("/search");
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  // Cập nhật checkOut khi checkIn thay đổi
  useEffect(() => {
    if (checkIn) {
      // Đảm bảo checkOut là ít nhất 1 ngày sau checkIn
      const newCheckOut = new Date(checkIn);
      newCheckOut.setDate(newCheckOut.getDate() + 1); // Thêm 1 ngày
      setCheckOut(newCheckOut);
    }
  }, [checkIn]);

  return (
    <form
      onSubmit={handleSubmit}
      className="-mt-8 p-3 bg-orange-400 rounded shadow-md grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4"
    >
      <div className="flex flex-row items-center flex-1 bg-white p-2">
        <MdTravelExplore size={25} className="mr-2" />
        <input
          placeholder="Where are you going?"
          className="text-md w-1/2 focus:outline-none"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        />
      </div>

      <div className="flex bg-white px-2 py-1 gap-2">
        <label className="items-center flex">
          Adults:
          <input
            className="w-1/2 p-1 focus:outline-none font-bold"
            type="number"
            min={1}
            max={20}
            value={adultCount}
            onChange={(event) => setAdultCount(parseInt(event.target.value))}
          />
        </label>
        <label className="items-center flex">
          Children:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={0}
            max={20}
            value={childCount}
            onChange={(event) => setChildCount(parseInt(event.target.value))}
          />
        </label>
      </div>
      <div>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-in Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn} // Chỉ cho phép chọn ngày check-out sau check-in
          maxDate={maxDate}
          placeholderText="Check-out Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div className="flex gap-1">
        <button className="flex items-center bg-blue-600 text-white h-full p-2 font-bold text-xl hover:bg-blue-500">
        <Search  size={24} className="mr-2"/>Search
        </button>
        <button
          type="button"
          className="flex items-center w-2/3 bg-red-600 text-white h-full p-2 font-bold text-xl hover:bg-red-500"
          onClick={() => {
            setDestination("");
            setAdultCount(0);
            setChildCount(0);
            setCheckIn(new Date());
          }}
        >
          <Eraser  size={24} className="mr-2"/>Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
