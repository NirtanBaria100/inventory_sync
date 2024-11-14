import { LegacyCard, Select , Text , Layout} from '@shopify/polaris'
import React from 'react'

const HomeCards = ({ label, value }) => {
  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection : "column",
        borderRadius: "10px",
        // border: "0.5px solid black",
         boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        width: "20%",
        backgroundColor: "white",
        height:"120px"
      }}
    >
      <Text variant="headingMd" as="h6">
        {label} 
      </Text>

      <Text variant="bodyLg" as="p">
        {value}
      </Text>

    </div>


  );
};


export default HomeCards