import React, { useState } from 'react';
import { Badge, BlockStack, InlineStack, Text } from '@shopify/polaris';
import copyIcon from '../../assets/copyIcon.png';

function InfoBox({ label, value, showCopyButton }) {
  // we send the label we want to give, the value and if we want to show the copy icon or not 
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>

      <BlockStack gap={"300"}>

        <InlineStack align='space-between'>

          <Text variant="headingMd" as="h6">


            {label}

          </Text>
          {showCopyButton && (
            <div
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: 'none',
                width: 'auto',
                height: '16px',
                position: 'relative',
              }}
            >
              {copied ? (
                <Text
                  variant="bodySm"
                  as="span"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: 'translateX(10px)',
                  }}
                >
                  Copied!
                </Text>
              ) : (
                <img
                  src={copyIcon}
                  alt="Copy"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          )}
        </InlineStack>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge >
            <Text variant="bodySm" as="p">
              {value}
            </Text>
          </Badge>

        </div>
      </BlockStack>

    </>
  );
}

export default InfoBox;

