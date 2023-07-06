"use client";
import { UserButton, useUser } from "@clerk/nextjs";

export const User = () => {
  const { user } = useUser();

  return (
    <div
      className="user-div"
      style={{
        width: "96.5%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#228be6 ",
        padding: "5px",
        margin: "5px",
        borderRadius: "5px",
        cursor: "pointer",
        position: "absolute",
        bottom: "5px",
        right: 0,
      }}
    >
      <UserButton />
      <div
        className="user-data-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {user?.username ? (
          <>
            <h3
              style={{
                fontSize: "20px",
              }}
            >
              {user?.username}
            </h3>
            <p
              style={{
                fontSize: "12px",
                opacity: ".75",
              }}
            >
              {user?.emailAddresses[0].emailAddress}
            </p>
          </>
        ) : (
          <h3
            style={{
              fontSize: "20px",
            }}
          >
            {user?.emailAddresses[0].emailAddress}
          </h3>
        )}
      </div>
    </div>
  );
};
