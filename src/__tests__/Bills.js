/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

// Mocking the store for API simulation
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      //simuler localstorage(api) par localStorageMock qui permet de stocker et récupérer des données sans réellement utiliser localStorage du navigateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      //on crée un utilisateur employee et on l'enregistre dans localStorage pour pouvoir le récupérer 
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      //Cette div est nécessaire pour que la page "Bills" puisse être affichée et testée
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
    });
    //vérifier que l'icône des factures (icon-window) dans la barre latérale est bien mise en surbrillance (active-icon) lorsque l'utilisateur est sur la page des factures (Bills Page).
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);
      const windowIcon = await waitFor(() => screen.getByTestId("icon-window"));
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });



    test("Then bills should be ordered from earliest to latest", async () => {

      document.body.innerHTML = BillsUI({ data: bills });

      const dates = await waitFor(() =>
        screen
          .getAllByText(
            /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML)
      );

      const chronologicalOrder = (a, b) => (a < b ? -1 : 1);
      const datesSorted = [...dates].sort(chronologicalOrder);
      dates.sort(chronologicalOrder);
      expect(dates).toEqual(datesSorted);

    });

    


  });
  


});
