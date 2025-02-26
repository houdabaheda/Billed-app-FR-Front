/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage";
import { ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    });

    test("Then the form should be rendered", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    test("Then all form fields should be rendered", () => {
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
  });

  describe("When I upload a file", () => {
    test("Then it should accept a valid format", () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener("change", handleChangeFile);

      const testFile = new File(["test"], "test.jpg", { type: "image/jpg" });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("test.jpg");
    });

    test("Then it should reject an invalid format", () => {
      document.body.innerHTML = NewBillUI();
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
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      document.body.innerHTML = NewBillUI();
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = NewBillUI();
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test("Then it should display an error message if API returns 500", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        update: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
      }));

      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      fireEvent.submit(screen.getByTestId("form-new-bill"));

      await waitFor(() => expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500")));
    });

    test("Then it should display an error message if API returns 400", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        update: jest.fn(() => Promise.reject(new Error("Erreur 400"))),
      }));

      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      fireEvent.submit(screen.getByTestId("form-new-bill"));

      await waitFor(() => expect(console.error).toHaveBeenCalledWith(new Error("Erreur 400")));
    });
  });
});
