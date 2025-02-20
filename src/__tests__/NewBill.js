/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage";
import { ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";

// Mock the store and localStorage
jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // Set up the HTML structure and mock localStorage
      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    });

    test("Then the form should be rendered", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    test("Then all form fields should be rendered", () => {
      const expenseType = screen.getByTestId("expense-type");
      const expenseName = screen.getByTestId("expense-name");
      const datePicker = screen.getByTestId("datepicker");
      const amount = screen.getByTestId("amount");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");
      const fileInput = screen.getByTestId("file");

      expect(expenseType).toBeTruthy();
      expect(expenseName).toBeTruthy();
      expect(datePicker).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(fileInput).toBeTruthy();
    });
  });

  describe("When I upload a file with a valid format", () => {
    test("Then the file should be accepted", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      const fileInput = screen.getByTestId("file");

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener("change", handleChangeFile);

      const testFile = new File(["test"], "test.jpg", { type: "image/jpg" });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("test.jpg");
    });
  });

})


describe("When I upload a file with an invalid format", () => {
  test("Then an alert should be shown and the file input should be cleared", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
    const fileInput = screen.getByTestId("file");

    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
    fileInput.addEventListener("change", handleChangeFile);

    const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(fileInput.value).toBe("");
  });
});

describe("When I submit the form with valid data", () => {
  test("Then it should call updateBill and navigate to Bills page", () => {
    const onNavigate = jest.fn();
    const store = mockStore;
    const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });

    const html = NewBillUI();
    document.body.innerHTML = html;

    const handleSubmit = jest.fn(newBill.handleSubmit);
    const form = screen.getByTestId("form-new-bill");

    form.addEventListener("submit", handleSubmit);

    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
  });
});



