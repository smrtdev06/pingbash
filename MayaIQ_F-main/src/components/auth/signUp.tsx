
import React, { useRef, useState, useEffect, MouseEvent, ChangeEvent, useCallback, } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import httpCode from "../../resource/const/httpCode";
import { toast } from "react-hot-toast";
// import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import Link from "next/link";
import Image from "next/image";
import { SERVER_URL } from "@/resource/const/const";
import axios from "axios";
// import { GOOGLE_MAPS_API_KEY } from "@/resource/const/const";
import messages from "@/resource/const/messages";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import CountrySelector from "./countrySelector";

interface CountryOption {
  label: string;
  value: string;
  flag: string;
}

interface Coords {
  lat: number;
  lng: number;
}

const SignUp: React.FC = () => {

  const params = useSearchParams();
  const router = useRouter()
  const path = usePathname()

  const emailRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
  const professionRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [passShow, setPassShow] = useState(false)
  const [passConfirmShow, setPassConfirmShow] = useState(false)

  const [countries, setCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [addressInput, setAddressInput] = useState<string>("");

  const [clickedCoords, setClickedCoords] = useState<Coords>({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState<Coords>({ lat: 37.7749, lng: -122.4194 });

  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const birthdayRef = useRef<HTMLInputElement>(null);

  // const { isLoaded, loadError } = useJsApiLoader({
  //   id: "google-map-script",
  //   googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  // });

  // To get the countries name and professional kinds initially
  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     dispatch(setIsLoading(true))
  //     try {
  //       const response = await axios.get("https://restcountries.com/v3.1/all");

  //       const countryNames = response.data.map(
  //         (country: any) => country.name.common
  //       );
  //       setCountries(countryNames);

  //     } catch (error) {
  //       toast.error(messages.signup.retrievingCountryListError)
  //     }
  //     dispatch(setIsLoading(false))
  //   };

  //   fetchCountries();
  // }, [dispatch, params]);

  // To handle the function for clicking the Map
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setClickedCoords({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, []);

  // This is a function when clicking Sign Up button
  const signUpHandler = async (event: MouseEvent<HTMLButtonElement>) => {

    event.preventDefault();
    if (nameRef.current && nameRef.current.value && emailRef.current && emailRef.current.value
      && passwordRef.current && passwordRef.current.value && passwordConfirmRef.current?.value === passwordRef.current?.value) {

      // When all form are filled
      dispatch(setIsLoading(true))
      try {
        const result = await axios.post(`${SERVER_URL}/api/user/register`, {
          Name: nameRef.current.value,
          Email: emailRef.current.value,
          Password: passwordRef.current.value,
          // Profession:professionRef.current.value,
          // Address: "Test Address",
          // Geometry: clickedCoords,
          // Role: 0,
          // country: selectedCountry?.value,
          // gender: selectedGender,
          // birthday: birthdayRef.current?.value
        });
        toast.success(messages.signup.success);
        router.push(`${path}?Role=${params.get("Role")}&Collection=signVerify&Email=${emailRef.current.value}&Type=signUp`);
        
      } catch (error: any) {
        console.log("Error ===>");
        console.log(error.response);
        if (error.response) {
          const errorCode: number = error.response.status;

          switch (errorCode) {
            case httpCode.INVALID_MSG:
              toast.error(messages.common.invalidMsg);
              break;
            case httpCode.DUPLICATED:
              toast.success(messages.common.duplicated);
              break;
            default:
              toast.error(messages.common.unexpected);
          }
        } else {
          toast.error(messages.common.unexpected);
        }
      }
      dispatch(setIsLoading(false))
    } else {
      // When there is any empty form
      if (!emailRef.current?.value) {
        emailRef.current?.focus();
      } else if (!passwordRef.current?.value) {
        passwordRef.current?.focus()
      } else if (passwordConfirmRef.current?.value !== passwordRef.current?.value) {
        passwordConfirmRef.current?.focus()
      } else if (!nameRef.current?.value) {
        nameRef.current?.focus()
      } else if (!professionRef.current?.value) {
        professionRef.current?.focus()
      }
      else addressRef.current?.focus()
    }
  };

  // This is a function to handle the addresss change
  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setAddressInput(input);
    const filtered = countries.filter((country) =>
      country.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  // This is a function to handle country selection
  // const handleCountrySelect = async (countryName: string) => {
  //   setAddressInput(countryName);
  //   setFilteredCountries([]);

  //   try {
  //     const response = await axios.get(
  //       `https://restcountries.com/v3.1/name/${countryName}`
  //     );
  //     const countryCoords = response.data[0].latlng;
  //     setMapCenter({ lat: countryCoords[0], lng: countryCoords[1] });
  //     setClickedCoords({ lat: countryCoords[0], lng: countryCoords[1] });
  //   } catch (error) {
  //     toast.error(messages.signup.mapAccessError)
  //   }
  // };

  // This is a function to create marker 
  // const createMarker = (
  //   map: google.maps.Map,
  //   position: google.maps.LatLngLiteral
  //   ) => {
  //   return new google.maps.marker.AdvancedMarkerElement({
  //     map,
  //     position,
  //   });
  // };

  // if (loadError) {
  //   return <div>Error loading map</div>;
  // }

  const countrySelectorStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    border: state.isSelected || state.isFocused ? '2px solid #000000 !important' : '1px solid #6B7280', // blue-500 vs gray-500
    borderRadius: 9999, // rounded-full
    backgroundColor: '#F3F4F6', // bg-gray-100
    paddingTop: '0.125rem',
    paddingBottom: '0.125rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    boxShadow: 'none', // ring-blue-200
    // transition: 'all 0.2s ease-in-out',
    width: '100%',
  }),
};
 console.log(clickedCoords)
  return (
    <div className="signup bg-white flex flex-row justify-center items-center w-full">
      {/* Left-Side with SignUp Image */}
      <div className="left-side w-full md:w-1/2 hidden md:block">
        <Image src="/signup.png" alt="Login Image" width={400} height={800} className="w-full h-screen object-cover" priority />
      </div>

      {/* Right-Side with SignUp data */}
      <div className="right-side w-full md:w-1/2 pt-8 overflow-x-auto h-screen">
        {/* Sign Up container */}
        <div className="signup_container mx-8 max-[320px]:mx-4">

          {/* start Logo */}
          <div className="top_mayaIq ">
            <Link href="/" className="flex items-center">
              <Image src="/logo-orange.png" alt="logo" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <p className="text-3xl font-bold pl-4">PingBash</p>
            </Link>
          </div>
          {/* end Logo */}

          {/* SignUp to Vendor Portal */}
          <div className="welcomeback pt-4">
            <p className="title text-2xl font-bold max-[320px]:text-center">Signup and Discover the Magic</p>
            <p className="description pt-4 text-sm">
            </p>
          </div>


          {/* <button className="flex my-5 bg-gray-100 hover:bg-white w-full justify-center items-center border p-2 rounded-full">
            <Image className="mx-2" src={`/assets/googleAuthLogo.svg`} width={100} height={100} alt="" style={{ width: "auto", height: "auto" }} priority />
            <span className="font-semibold max-[320px]:text-sm">Continue with Google</span>
          </button>
          <button className="flex my-5 bg-gray-100 hover:bg-white w-full justify-center items-center border p-2 rounded-full">
            <Image className="mx-2" src={`/assets/appleAuthLogo.svg`} width={100} height={100} alt="" style={{ width: "auto", height: "auto" }} priority />
            <span className="font-semibold max-[320px]:text-sm">Continue with Apple</span>
          </button>

          <div className="flex items-center justify-between max-[320px]:text-sm">
            <hr className="w-5/12 border" />
            <span>Or</span>
            <hr className="w-5/12 border" />
          </div> */}

          {/* Input Email Address */}
          <div className="email_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Email Address *</p>
            <input type="text" ref={emailRef} placeholder="example@example.com" autoComplete="email"
              className="w-full border border-gray-500 bg-gray-100 rounded-full  py-2 px-5" />
          </div>

          {/* Input Full Name Field */}
          <div className="fullname_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">User Name *</p>
            <input type="text" ref={nameRef} placeholder="Enter your Name" autoComplete="off"
              className="w-full border border-gray-500 bg-gray-100 rounded-full  py-2 px-5" />
          </div>

          {/* Input Password Field */}
          <div className="password_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Enter New Password *</p>
            <div className="relative">
              <input type={passShow ? "text" : "password"} ref={passwordRef} placeholder={passShow ? "Password" : "********"}
                className="w-full border border-gray-500 bg-gray-100 rounded-full py-2 px-5" />
              <span onClick={() => setPassShow(!passShow)} className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Image src={`/assets/${passShow ? "passHide" : "passShow"}.svg`} alt="eye" className="eye w-2" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              </span>
            </div>
          </div>

          {/* Input confirm Password Field */}
          <div className="password_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Confirm New Password *</p>
            <div className="relative">
              <input type={passConfirmShow ? "text" : "password"} ref={passwordConfirmRef} placeholder={passConfirmShow ? "Password" : "********"}
                className="w-full border border-gray-500 bg-gray-100 rounded-full  py-2 px-5" />
              <span onClick={() => setPassConfirmShow(!passConfirmShow)} className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Image src={`/assets/${passConfirmShow ? "passHide" : "passShow"}.svg`} alt="eye" className="eye w-2" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              </span>
            </div>
          </div>

          {/* Input Description Professional Field */}
          {/* <div className="relative description_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Description</p>
            <input type="text" ref={professionRef} 
              placeholder="Tell us about you in a few words..."
              className="w-full border border-gray-500 bg-gray-100 rounded-full py-2 px-5"
            />
          </div> */}

          {/* Input country Field */}
          {/* <div className="relative description_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Select your Country</p>
            <CountrySelector 
              onChange={setSelectedCountry}
              selectedCountryCode={selectedCountry?.value}
              customStyles={countrySelectorStyles} />
          </div> */}
          {/* Gender Picker */}
          {/* <div className="gender_area pt-4 max-[320px]:text-sm">
            <p className="font-bold mb-2">Gender</p>
            <div className="flex gap-3">
              {['Female', 'Male', 'Other'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setSelectedGender(gender)}
                  className={`w-full border rounded-full py-2 px-5 text-center
                    ${
                      selectedGender === gender
                        ? 'border-2 border-black bg-gray-300 text-gray-700'
                        : 'border-gray-500 bg-gray-100 text-gray-700 hover:border-gray-600'
                    }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div> */}

          {/* Birthday Picker Field */}
          {/* <div className="birthday_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Birthday</p>
            <input
              type="date"
              ref={birthdayRef}
              autoComplete="bday"
              className="w-full border border-gray-500 bg-gray-100 rounded-full py-2 px-5 text-gray-700"
              max={new Date().toISOString().split("T")[0]} // disables future dates
            />
          </div> */}

      {/* {selectedCountry && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            Selected:{" "}
            <img
              src={selectedCountry.flag}
              alt=""
              style={{ width: 20, height: 15, marginRight: 6 }}
            />
            {selectedCountry.label} ({selectedCountry.value})
          </p>
        </div>
      )} */}
          {/* Input Location Area */}
          {/* <div className="location_area pt-8 relative max-[320px]:text-sm">
            <p className="font-bold">Location Address</p>
            <input type="text" ref={addressRef} value={addressInput}
              placeholder="Enter your current address"
              className="w-full border border-gray-500 bg-gray-100 rounded-full py-2 px-5"
              onChange={handleAddressChange} />

            {filteredCountries.length > 0 && (
              <div className="absolute h-40 overflow-y-auto shadow-sm shadow-gray-700 z-10 bg-white mt-1 p-2 border border-gray-300 rounded-lg w-full">
                {filteredCountries.map((country, index) => (
                  <div
                    key={index}
                    onClick={() => handleCountrySelect(country)}
                    className="cursor-pointer hover:bg-gray-200 p-1 rounded-md"
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Input Map Area */}
          {/* <div className="Map_area pt-4 w-full">
            {isLoaded ? (
              <GoogleMap
                onClick={handleMapClick}
                mapContainerStyle={{ width: "100%", height: "200px" }}
                zoom={10}
                center={mapCenter}
                onLoad={(map) => {
                  if (clickedCoords.lat && clickedCoords.lng) {
                    createMarker(map, clickedCoords);
                  }
                }}
              />
            ) : (
              <div>Loading Map...</div>
            )}
          </div> */}

          {/* Sign Up Button */}
          <div className="signup_btn pt-12 text-white w-full max-[320px]:text-sm">
            <button onClick={signUpHandler}
              className="inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center" >
              Sign Up
            </button>
          </div>

          {/* Sign Up Bottom */}
          <div className="extra_area pt-6 flex flex-col items-center pb-8 max-[320px]:text-sm">
            <div className="signup_ms flex flex-wrap">
              <p>Already have an account?</p>
              <Link href={`/auth?Collection=login&Role=${params.get("Role")}`}
                className="pl-1 text-purple-900 font-bold underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
