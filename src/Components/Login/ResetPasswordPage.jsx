import React from "react";
import ResetLink from "./ResetLink";     // email entry page
import SetPassword from "./SetPassword"; // new password page

// One route (/resetpassword) for both screens.
// If URL has ?token=... -> show SetPassword, else show ResetLink.
const ResetPasswordPage = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  return token ? <SetPassword /> : <ResetLink />;
};

export default ResetPasswordPage;
