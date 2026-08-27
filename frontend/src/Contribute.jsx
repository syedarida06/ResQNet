import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./Contribute.css";

const API_URL = "https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app";

const CONTRIBUTION_TYPES = [
  "Money",
  "Food",
  "Water",
  "Medicines",
  "Clothing",
  "Rescue Equipment",
  "Other",
];

function Contribute() {
  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [contributionId, setContributionId] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [paymentModalOpen, setPaymentModalOpen] =
    useState(false);

  const [paymentProcessing, setPaymentProcessing] =
    useState(false);

  const [paymentSuccessful, setPaymentSuccessful] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "Card",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const [formData, setFormData] = useState({
    emergencyId: "",
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    contributionType: "Money",
    amount: "",
    quantity: "",
    itemDetails: "",
    message: "",
  });

  /* =======================================================
     LOAD ACTIVE EMERGENCIES
  ======================================================= */

  useEffect(() => {
    fetchEmergencies();
  }, []);

  async function fetchEmergencies() {
    try {
      setLoadingEmergencies(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_URL}/api/contributions/emergencies`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load emergencies."
        );
      }

      setEmergencies(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Emergency loading error:",
        error
      );

      setErrorMessage(
        "Unable to load active emergency requests. Please try again."
      );
    } finally {
      setLoadingEmergencies(false);
    }
  }

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target;

    let cleanedValue = value;

    if (name === "cardNumber") {
      cleanedValue = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }

    if (name === "expiry") {
      cleanedValue = value
        .replace(/\D/g, "")
        .slice(0, 4);

      if (cleanedValue.length >= 3) {
        cleanedValue =
          cleanedValue.slice(0, 2) +
          "/" +
          cleanedValue.slice(2);
      }
    }

    if (name === "cvv") {
      cleanedValue = value
        .replace(/\D/g, "")
        .slice(0, 3);
    }

    setPaymentForm((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));

    setPaymentError("");
  }

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  function formatAmount(amount) {
    if (!amount) {
      return "₹0";
    }

    return `₹${Number(
      amount
    ).toLocaleString("en-IN")}`;
  }

  /* =======================================================
     SELECTED EMERGENCY
  ======================================================= */

  const selectedEmergency =
    emergencies.find(
      (emergency) =>
        String(emergency._id) ===
        String(formData.emergencyId)
    );

  /* =======================================================
     DATE
  ======================================================= */

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetMainForm() {
    setFormData({
      emergencyId: "",
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      contributionType: "Money",
      amount: "",
      quantity: "",
      itemDetails: "",
      message: "",
    });
  }

  function resetPaymentForm() {
    setPaymentForm({
      paymentMethod: "Card",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      upiId: "",
    });

    setPaymentError("");
    setPaymentProcessing(false);
    setPaymentSuccessful(false);
  }

  /* =======================================================
     VALIDATE MAIN FORM
  ======================================================= */

  function validateMainForm() {
    if (!formData.emergencyId) {
      setErrorMessage(
        "Please select an emergency you want to support."
      );
      return false;
    }

    if (!formData.donorName.trim()) {
      setErrorMessage(
        "Please enter your name."
      );
      return false;
    }

    if (!formData.donorPhone.trim()) {
      setErrorMessage(
        "Please enter your phone number."
      );
      return false;
    }

    if (!formData.donorEmail.trim()) {
      setErrorMessage(
        "Please enter your email address."
      );
      return false;
    }

    if (
      formData.contributionType ===
      "Money"
    ) {
      const amount = Number(
        formData.amount
      );

      if (
        !formData.amount ||
        amount <= 0
      ) {
        setErrorMessage(
          "Please enter a valid contribution amount."
        );
        return false;
      }

      if (amount > 10000000) {
        setErrorMessage(
          "Please enter an amount below ₹1,00,00,000."
        );
        return false;
      }
    }

    if (
      formData.contributionType !==
      "Money"
    ) {
      const quantity = Number(
        formData.quantity
      );

      if (
        (!formData.quantity ||
          quantity <= 0) &&
        !formData.itemDetails.trim()
      ) {
        setErrorMessage(
          "Please enter the quantity or describe the items you want to contribute."
        );
        return false;
      }
    }

    return true;
  }

  /* =======================================================
     NON-MONEY SUBMISSION
  ======================================================= */

  async function submitNonMoneyContribution() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      setContributionId("");
      setTransactionId("");

      const payload = {
        emergencyId:
          formData.emergencyId,

        donorName:
          formData.donorName.trim(),

        donorPhone:
          formData.donorPhone.trim(),

        donorEmail:
          formData.donorEmail
            .trim()
            .toLowerCase(),

        contributionType:
          formData.contributionType,

        amount: 0,

        quantity:
          Number(
            formData.quantity
          ) || 0,

        itemDetails:
          formData.itemDetails.trim(),

        message:
          formData.message.trim(),
      };

      const response =
        await fetch(
          `${API_URL}/api/contributions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to submit contribution."
        );
      }

      setContributionId(
        result.data?.contributionId ||
          ""
      );

      setSuccessMessage(
        `Your ${formData.contributionType.toLowerCase()} contribution request has been submitted successfully. The ResQNet response team will contact you immediately for coordination.`
      );

      resetMainForm();
    } catch (error) {
      console.error(
        "Non-money contribution error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Failed to submit contribution. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     OPEN PAYMENT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateMainForm()) {
      return;
    }

    if (
      formData.contributionType !==
      "Money"
    ) {
      await submitNonMoneyContribution();
      return;
    }

    resetPaymentForm();

    setPaymentSuccessful(false);
    setPaymentModalOpen(true);
  }

  /* =======================================================
     VALIDATE PAYMENT
  ======================================================= */

  function validatePayment() {
    if (
      paymentForm.paymentMethod ===
      "Card"
    ) {
      if (
        !paymentForm.cardName.trim()
      ) {
        setPaymentError(
          "Please enter the cardholder name."
        );
        return false;
      }

      const cardDigits =
        paymentForm.cardNumber.replace(
          /\s/g,
          ""
        );

      if (
        cardDigits.length !== 16
      ) {
        setPaymentError(
          "Please enter a valid 16-digit card number."
        );
        return false;
      }

      if (
        !/^\d{2}\/\d{2}$/.test(
          paymentForm.expiry
        )
      ) {
        setPaymentError(
          "Please enter the expiry date in MM/YY format."
        );
        return false;
      }

      if (
        paymentForm.cvv.length !==
        3
      ) {
        setPaymentError(
          "Please enter a valid 3-digit CVV."
        );
        return false;
      }
    }

    if (
      paymentForm.paymentMethod ===
      "UPI"
    ) {
      if (
        !paymentForm.upiId.trim()
      ) {
        setPaymentError(
          "Please enter your UPI ID."
        );
        return false;
      }

      if (
        !paymentForm.upiId.includes(
          "@"
        )
      ) {
        setPaymentError(
          "Please enter a valid UPI ID."
        );
        return false;
      }
    }

    return true;
  }

  /* =======================================================
     PAYMENT
  ======================================================= */

  async function processPayment() {
    setPaymentError("");

    if (!validatePayment()) {
      return;
    }

    try {
      setPaymentProcessing(true);

      const cardDigits =
        paymentForm.cardNumber.replace(
          /\s/g,
          ""
        );

      const paymentPayload = {
        emergencyId:
          formData.emergencyId,

        donorName:
          formData.donorName.trim(),

        donorPhone:
          formData.donorPhone.trim(),

        donorEmail:
          formData.donorEmail
            .trim()
            .toLowerCase(),

        contributionType:
          "Money",

        amount:
          Number(formData.amount),

        quantity: 0,

        itemDetails: "",

        message:
          formData.message.trim(),

        paymentMethod:
          paymentForm.paymentMethod,

        cardLast4:
          paymentForm.paymentMethod ===
          "Card"
            ? cardDigits.slice(-4)
            : "",

        upiId:
          paymentForm.paymentMethod ===
          "UPI"
            ? paymentForm.upiId
                .trim()
            : "",
      };

      /*
       * Small delay intentionally creates
       * a professional payment-processing
       * experience in the hackathon demo.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1600)
      );

      const response =
        await fetch(
          `${API_URL}/api/contributions/payment`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                paymentPayload
              ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Payment could not be completed."
        );
      }

      setContributionId(
        result.data?.contributionId ||
          ""
      );

      setTransactionId(
        result.data?.transactionId ||
          ""
      );

      setPaymentSuccessful(true);
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setPaymentError(
        error.message ||
          "Payment could not be completed."
      );
    } finally {
      setPaymentProcessing(false);
    }
  }

  /* =======================================================
     CLOSE PAYMENT
  ======================================================= */

  function closePaymentModal() {
    if (paymentProcessing) {
      return;
    }

    setPaymentModalOpen(false);
    resetPaymentForm();
  }

  /* =======================================================
     FINISH AFTER PAYMENT
  ======================================================= */

  function finishSuccessfulPayment() {
    setPaymentModalOpen(false);

    setSuccessMessage(
      `Payment of ${formatAmount(
        formData.amount
      )} was completed successfully. Your contribution has been recorded for the selected emergency.`
    );

    setErrorMessage("");

    resetPaymentForm();
    resetMainForm();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="contribute-page">

      <Navbar />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="contribute-hero">

        <div className="contribute-hero-content">

          <span className="contribute-eyebrow">
            CONTRIBUTE TO RELIEF
          </span>

          <h1>
            Help where it
            <br />
            matters most.
          </h1>

          <p>
            Support people affected by
            disasters by contributing
            directly to an active
            emergency response through
            the ResQNet network.
          </p>

          <div className="hero-trust">

            <span>
              ✓ Verified emergency requests
            </span>

            <span>
              ✓ Secure contribution records
            </span>

            <span>
              ✓ ResQNet response network
            </span>

          </div>

        </div>

      </section>

      {/* =================================================
          PAYMENT MODAL
      ================================================= */}

      {paymentModalOpen && (
        <div className="payment-overlay">

          <div className="payment-modal">

            {!paymentSuccessful ? (
              <>
                <div className="payment-modal-header">

                  <div>
                    <span>
                      RESQNET SECURE CHECKOUT
                    </span>

                    <h2>
                      Complete your contribution
                    </h2>

                    <p>
                      Your contribution is being
                      directed to the selected
                      emergency response.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="payment-close"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      paymentProcessing
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="payment-order-summary">

                  <div className="payment-order-icon">
                    ₹
                  </div>

                  <div className="payment-order-details">

                    <span>
                      CONTRIBUTION
                    </span>

                    <strong>
                      {formatAmount(
                        formData.amount
                      )}
                    </strong>

                    <small>
                      {selectedEmergency
                        ?.emergencyType ||
                        "Emergency relief"}
                    </small>

                  </div>

                  <div className="payment-order-incident">
                    <span>
                      SUPPORTING
                    </span>

                    <strong>
                      {selectedEmergency
                        ?.location ||
                        "Selected emergency"}
                    </strong>
                  </div>

                </div>

                <div className="payment-method-switch">

                  <button
                    type="button"
                    className={
                      paymentForm.paymentMethod ===
                      "Card"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPaymentForm(
                        (previous) => ({
                          ...previous,
                          paymentMethod:
                            "Card",
                        })
                      )
                    }
                    disabled={
                      paymentProcessing
                    }
                  >
                    💳 Card
                  </button>

                  <button
                    type="button"
                    className={
                      paymentForm.paymentMethod ===
                      "UPI"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPaymentForm(
                        (previous) => ({
                          ...previous,
                          paymentMethod:
                            "UPI",
                        })
                      )
                    }
                    disabled={
                      paymentProcessing
                    }
                  >
                    📱 UPI
                  </button>

                </div>

                {paymentForm.paymentMethod ===
                  "Card" && (
                  <div className="payment-fields">

                    <div className="payment-field">

                      <label>
                        Cardholder name
                      </label>

                      <input
                        type="text"
                        name="cardName"
                        value={
                          paymentForm.cardName
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="Name on card"
                        disabled={
                          paymentProcessing
                        }
                      />

                    </div>

                    <div className="payment-field">

                      <label>
                        Card number
                      </label>

                      <input
                        type="text"
                        name="cardNumber"
                        value={
                          paymentForm.cardNumber
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        disabled={
                          paymentProcessing
                        }
                      />

                    </div>

                    <div className="payment-two-column">

                      <div className="payment-field">

                        <label>
                          Expiry
                        </label>

                        <input
                          type="text"
                          name="expiry"
                          value={
                            paymentForm.expiry
                          }
                          onChange={
                            handlePaymentChange
                          }
                          placeholder="MM/YY"
                          inputMode="numeric"
                          disabled={
                            paymentProcessing
                          }
                        />

                      </div>

                      <div className="payment-field">

                        <label>
                          CVV
                        </label>

                        <input
                          type="password"
                          name="cvv"
                          value={
                            paymentForm.cvv
                          }
                          onChange={
                            handlePaymentChange
                          }
                          placeholder="•••"
                          inputMode="numeric"
                          disabled={
                            paymentProcessing
                          }
                        />

                      </div>

                    </div>

                  </div>
                )}

                {paymentForm.paymentMethod ===
                  "UPI" && (
                  <div className="payment-fields">

                    <div className="payment-field">

                      <label>
                        UPI ID
                      </label>

                      <input
                        type="text"
                        name="upiId"
                        value={
                          paymentForm.upiId
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="name@upi"
                        disabled={
                          paymentProcessing
                        }
                      />

                    </div>

                  </div>
                )}

                {paymentError && (
                  <div className="payment-error">

                    <span>!</span>

                    <p>
                      {paymentError}
                    </p>

                  </div>
                )}

                <div className="payment-security">

                  <div>
                    <span>🔒</span>

                    <div>
                      <strong>
                        Secure checkout
                      </strong>

                      <small>
                        Demo payment environment
                        for the ResQNet hackathon.
                      </small>
                    </div>
                  </div>

                </div>

                <button
                  type="button"
                  className="pay-now-button"
                  onClick={
                    processPayment
                  }
                  disabled={
                    paymentProcessing
                  }
                >

                  {paymentProcessing ? (
                    <>
                      <span className="button-spinner" />
                      Processing payment...
                    </>
                  ) : (
                    <>
                      Pay{" "}
                      {formatAmount(
                        formData.amount
                      )}{" "}
                      →
                    </>
                  )}

                </button>

                <div className="payment-demo-warning">
                  <strong>
                    HACKATHON DEMO
                  </strong>

                  <span>
                    This interface demonstrates
                    a realistic payment journey.
                    No real bank/card transaction
                    is performed.
                  </span>
                </div>
              </>
            ) : (
              <div className="payment-success-screen">

                <div className="payment-success-circle">
                  ✓
                </div>

                <span className="payment-success-label">
                  PAYMENT SUCCESSFUL
                </span>

                <h2>
                  Contribution received
                </h2>

                <p>
                  Your contribution of{" "}
                  <strong>
                    {formatAmount(
                      formData.amount
                    )}
                  </strong>{" "}
                  has been successfully
                  recorded for this emergency.
                </p>

                <div className="transaction-card">

                  <div>
                    <span>
                      AMOUNT
                    </span>

                    <strong>
                      {formatAmount(
                        formData.amount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      TRANSACTION ID
                    </span>

                    <strong>
                      {transactionId ||
                        "TXN-RQ-********"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      CONTRIBUTION ID
                    </span>

                    <strong>
                      {contributionId ||
                        "CON-*****"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      INCIDENT
                    </span>

                    <strong>
                      {selectedEmergency
                        ?.emergencyType ||
                        "Emergency relief"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      DATE & TIME
                    </span>

                    <strong>
                      {formatDate(
                        new Date()
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      STATUS
                    </span>

                    <strong className="transaction-paid">
                      PAID
                    </strong>
                  </div>

                </div>

                <div className="payment-success-note">
                  <span>
                    ✓
                  </span>

                  <p>
                    The ResQNet response network
                    has your contribution record.
                    Thank you for supporting relief
                    operations.
                  </p>
                </div>

                <button
                  type="button"
                  className="payment-done-button"
                  onClick={
                    finishSuccessfulPayment
                  }
                >
                  Done
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="contribute-container">

        <div className="contribute-intro">

          <div>

            <span className="section-label">
              MAKE AN IMPACT
            </span>

            <h2>
              Contribute to an
              <br />
              active emergency
            </h2>

          </div>

          <p>
            Choose an active emergency
            created through the ResQNet
            citizen portal and decide how
            you would like to help.
          </p>

        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (
          <div className="contribute-success">

            <div className="success-icon">
              ✓
            </div>

            <div className="success-content">

              <strong>
                Contribution submitted
              </strong>

              <p>
                {successMessage}
              </p>

              {contributionId && (
                <div className="success-id">

                  <span>
                    Contribution ID
                  </span>

                  <strong>
                    {contributionId}
                  </strong>

                </div>
              )}

              <small>
                Your contribution is now
                recorded in the ResQNet
                backend.
              </small>

            </div>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div className="contribute-error">

            <div className="error-symbol">
              !
            </div>

            <div>

              <strong>
                Unable to continue
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

          </div>
        )}

        <form
          className="contribute-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              STEP 1 — INCIDENT
          ================================================= */}

          <section className="contribute-card">

            <div className="card-heading">

              <div className="card-number">
                01
              </div>

              <div>

                <span>
                  SELECT INCIDENT
                </span>

                <h3>
                  Where would you like to help?
                </h3>

              </div>

            </div>

            {loadingEmergencies ? (
              <div className="loading-state">

                <div className="loading-spinner" />

                Loading active emergencies...

              </div>
            ) : emergencies.length ===
              0 ? (
              <div className="empty-state">

                <div className="empty-icon">
                  ✓
                </div>

                <h4>
                  No active emergencies
                </h4>

                <p>
                  Submit an emergency through
                  the Citizen portal first.
                  Active requests will appear
                  here automatically.
                </p>

                <button
                  type="button"
                  onClick={
                    fetchEmergencies
                  }
                >
                  Refresh requests
                </button>

              </div>
            ) : (
              <div className="emergency-selection">

                {emergencies.map(
                  (emergency) => (
                    <label
                      className={`emergency-option ${
                        String(
                          formData.emergencyId
                        ) ===
                        String(
                          emergency._id
                        )
                          ? "selected"
                          : ""
                      }`}
                      key={
                        emergency._id
                      }
                    >

                      <input
                        type="radio"
                        name="emergencyId"
                        value={
                          emergency._id
                        }
                        checked={
                          String(
                            formData.emergencyId
                          ) ===
                          String(
                            emergency._id
                          )
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <div className="emergency-option-content">

                        <div className="emergency-option-top">

                          <strong>
                            {emergency.emergencyType ||
                              "Emergency"}
                          </strong>

                          <span
                            className={`severity ${
                              String(
                                emergency.severity ||
                                  "Medium"
                              ).toLowerCase()
                            }`}
                          >
                            {emergency.severity ||
                              "Medium"}
                          </span>

                        </div>

                        <p>
                          {emergency.description ||
                            "Emergency assistance required."}
                        </p>

                        <div className="emergency-meta">

                          <span>
                            📍{" "}
                            {emergency.location ||
                              emergency.address ||
                              "Location unavailable"}
                          </span>

                          <span>
                            👥{" "}
                            {emergency.people ||
                              emergency.peopleCount ||
                              1}{" "}
                            people affected
                          </span>

                        </div>

                        <small>
                          Reported{" "}
                          {formatDate(
                            emergency.createdAt
                          )}
                        </small>

                      </div>

                      <div className="selection-check">
                        ✓
                      </div>

                    </label>
                  )
                )}

              </div>
            )}

          </section>

          {/* =================================================
              SELECTED EMERGENCY
          ================================================= */}

          {selectedEmergency && (
            <div className="selected-emergency">

              <div className="selected-indicator">
                ✓
              </div>

              <div className="selected-details">

                <span>
                  SUPPORTING
                </span>

                <strong>
                  {selectedEmergency.emergencyType ||
                    "Emergency"}
                </strong>

                <p>
                  📍{" "}
                  {selectedEmergency.location ||
                    selectedEmergency.address ||
                    "Location unavailable"}
                </p>

              </div>

              <div className="selected-status">
                ACTIVE
              </div>

            </div>
          )}

          {/* =================================================
              STEP 2 — DONOR
          ================================================= */}

          <section className="contribute-card">

            <div className="card-heading">

              <div className="card-number">
                02
              </div>

              <div>

                <span>
                  YOUR DETAILS
                </span>

                <h3>
                  Tell us who is contributing
                </h3>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Full name
                </label>

                <input
                  type="text"
                  name="donorName"
                  value={
                    formData.donorName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Phone number
                </label>

                <input
                  type="tel"
                  name="donorPhone"
                  value={
                    formData.donorPhone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Email address
                </label>

                <input
                  type="email"
                  name="donorEmail"
                  value={
                    formData.donorEmail
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            <div className="privacy-note">

              <span>
                🔒
              </span>

              Your contact details are
              used only for contribution
              records and relief coordination.

            </div>

          </section>

          {/* =================================================
              STEP 3 — CONTRIBUTION
          ================================================= */}

          <section className="contribute-card">

            <div className="card-heading">

              <div className="card-number">
                03
              </div>

              <div>

                <span>
                  YOUR CONTRIBUTION
                </span>

                <h3>
                  What would you like to provide?
                </h3>

              </div>

            </div>

            <div className="contribution-types">

              {CONTRIBUTION_TYPES.map(
                (type) => (
                  <label
                    key={type}
                    className={`contribution-type ${
                      formData.contributionType ===
                      type
                        ? "active"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="contributionType"
                      value={type}
                      checked={
                        formData.contributionType ===
                        type
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      {type}
                    </span>

                    {formData.contributionType ===
                      type && (
                      <b>
                        ✓
                      </b>
                    )}

                  </label>
                )
              )}

            </div>

            {/* =================================================
                MONEY
            ================================================= */}

            {formData.contributionType ===
              "Money" && (
              <div className="money-section">

                <div className="form-field">

                  <label>
                    Contribution amount
                    <span>
                      INR
                    </span>
                  </label>

                  <div className="amount-input">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      name="amount"
                      min="1"
                      max="10000000"
                      step="1"
                      value={
                        formData.amount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter any amount"
                      inputMode="numeric"
                    />

                  </div>

                  <div className="quick-amounts">

                    {[500, 1000, 2000, 5000].map(
                      (amount) => (
                        <button
                          type="button"
                          key={amount}
                          className={
                            Number(
                              formData.amount
                            ) ===
                            amount
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setFormData(
                              (previous) => ({
                                ...previous,
                                amount:
                                  String(
                                    amount
                                  ),
                              })
                            )
                          }
                        >
                          ₹
                          {amount.toLocaleString(
                            "en-IN"
                          )}
                        </button>
                      )
                    )}

                  </div>

                  <div className="payment-demo-note">

                    <span className="payment-demo-icon">
                      ₹
                    </span>

                    <div>

                      <strong>
                        Secure contribution checkout
                      </strong>

                      <p>
                        Choose a suggested
                        amount or enter any
                        amount you wish to
                        contribute. The next
                        step opens the ResQNet
                        payment checkout.
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                NON MONEY
            ================================================= */}

            {formData.contributionType !==
              "Money" && (
              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={
                      formData.quantity
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 20"
                  />

                  <small>
                    Number of units you can
                    provide.
                  </small>

                </div>

                <div className="form-field">

                  <label>
                    Item details
                  </label>

                  <input
                    type="text"
                    name="itemDetails"
                    value={
                      formData.itemDetails
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`e.g. ${formData.contributionType}`}
                  />

                  <small>
                    Add useful details about
                    the contribution.
                  </small>

                </div>

              </div>
            )}

            {/* =================================================
                MESSAGE
            ================================================= */}

            <div className="form-field message-field">

              <label>
                Additional message
                <span>
                  Optional
                </span>
              </label>

              <textarea
                name="message"
                value={
                  formData.message
                }
                onChange={
                  handleChange
                }
                placeholder="Add any useful information about your contribution..."
                rows="4"
              />

            </div>

          </section>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <section className="contribute-submit">

            <div className="submit-info">

              <div className="submit-secure">

                <span>
                  ✓
                </span>

                RESQNET CONTRIBUTION

              </div>

              <strong>
                Ready to make a difference?
              </strong>

              <p>
                Money contributions continue
                to the payment checkout. Other
                contributions are submitted to
                the ResQNet coordination network
                for immediate follow-up.
              </p>

            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingEmergencies ||
                emergencies.length === 0
              }
            >

              {submitting ? (
                <>
                  <span className="button-spinner" />
                  Recording...
                </>
              ) : formData.contributionType ===
                "Money" ? (
                <>
                  Continue to Payment{" "}
                  <span>→</span>
                </>
              ) : (
                <>
                  Submit Contribution{" "}
                  <span>→</span>
                </>
              )}

            </button>

          </section>

          <div className="demo-disclaimer">

            <span>
              HACKATHON DEMO
            </span>

            Money checkout is a simulated
            payment experience for the
            ResQNet prototype. No real card
            or bank transaction is performed.

          </div>

        </form>

      </main>

    </div>
  );
}

export default Contribute;