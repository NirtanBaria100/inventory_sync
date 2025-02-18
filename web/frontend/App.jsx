import { BrowserRouter, Link,  } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { useDispatch, useSelector } from "react-redux";
import { setStartStoreData } from "./features/dataSlice"; 
import { React, useEffect } from 'react';



import { QueryProvider, PolarisProvider } from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

//maadhwan
//getting store data through redux

  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.data);

  // calling the api to get store details
  // if no store exists in db then empty string in the object
  useEffect(() => {
      async function getStoreDetails() {
          try {
              const response = await fetch("/api/shop");

              if (response.status === 404) {
                  dispatch(setStartStoreData({
                    id: "",
                    storeName: "",
                    key: "",
                    type: "",
                    newUser: true,
                    intialLoading:false           // intial loader false means the data has been fetched 
                }));

              } else if (response.status === 200) {
                  const data = await response.json()

                  dispatch(setStartStoreData({
                      id: data.id,
                      storeName: data.storeName,
                      key: data.key,
                      type: data.type,
                      newUser: false,
                      intialLoading:false             // intial loader false means the data has been fetched
                                                      //whenever data is fetched intial loading is false so we know the api was called
                  }));

              }
          } catch (error) {
              console.error('Error during API call:', error);
          } 
      }

      getStoreDetails();
  }, []);



  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <NavMenu>
            <Link to="/" rel="home" />
              <>
                {/* <Link to="/settings">Settings</Link> */}
                {/* <Link to="/stores">Connected Stores</Link>   */}
                <Link to="/products">Product Sync</Link>
              </>
          </NavMenu>
          <Routes pages={pages} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );


  // // original code by shopify commented 

  // return (
  //   <PolarisProvider>
  //     <BrowserRouter>
  //       <QueryProvider>
  //         <NavMenu>
  //           <a href="/" rel="home" />
  //           {/* <a href="/pagename">{t("NavigationMenu.pageName")}</a> */}
  //           <a href="/settings">{t("settings")}</a>
  //           <a href="/stores">{t("stores")}</a>
  //         </NavMenu>
  //         <Routes pages={pages} />
  //       </QueryProvider>
  //     </BrowserRouter>
  //   </PolarisProvider>
  // );
}
