const API_URL = 'https://norma.education-services.ru/api';

describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API_URL}/ingredients`, {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.visit('/');
    cy.wait('@getIngredients');
  });

  describe('Добавление ингредиентов', () => {
    it('добавляет булку в конструктор', () => {
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .find('button')
        .click();

      cy.get('[class*="constructor-element"]').should('exist');
      cy.contains('Краторная булка N-200i (верх)').should('exist');
      cy.contains('Краторная булка N-200i (низ)').should('exist');
    });

    it('добавляет начинку в конструктор', () => {
      cy.contains('Биокотлета из марсианской Магнолии')
        .closest('li')
        .find('button')
        .click();

      cy.contains('Биокотлета из марсианской Магнолии').should('exist');
    });
  });

  describe('Модальное окно ингредиента', () => {
    it('открывает модальное окно при клике на ингредиент', () => {
      cy.contains('Краторная булка N-200i').first().click();

      cy.get('[class*="modal"]').should('exist');
      cy.contains('Детали ингредиента').should('exist');
      cy.contains('Краторная булка N-200i').should('exist');
    });

    it('закрывает модальное окно по кнопке X', () => {
      cy.contains('Краторная булка N-200i').first().click();
      cy.get('[class*="modal"]').should('exist');

      cy.get('[class*="modal"] button').first().click();

      cy.get('[class*="modal"]').should('not.exist');
    });

    it('закрывает модальное окно по клику на оверлей', () => {
      cy.contains('Краторная булка N-200i').first().click();
      cy.get('[class*="modal"]').should('exist');

      cy.get('[class*="overlay"]').click({ force: true });

      cy.get('[class*="modal"]').should('not.exist');
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      cy.intercept('GET', `${API_URL}/auth/user`, {
        fixture: 'user.json'
      }).as('getUser');

      cy.intercept('POST', `${API_URL}/orders`, {
        fixture: 'order.json'
      }).as('postOrder');

      cy.setCookie('accessToken', 'Bearer test-access-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');

      cy.visit('/');
      cy.wait('@getIngredients');
    });

    it('создаёт заказ и показывает номер в модальном окне', () => {
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .find('button')
        .click();

      cy.contains('Биокотлета из марсианской Магнолии')
        .closest('li')
        .find('button')
        .click();

      cy.contains('Оформить заказ').click();
      cy.wait('@postOrder');

      cy.get('[class*="modal"]').should('exist');
      cy.contains('54321').should('exist');
    });

    it('очищает конструктор после оформления заказа', () => {
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .find('button')
        .click();

      cy.contains('Биокотлета из марсианской Магнолии')
        .closest('li')
        .find('button')
        .click();

      cy.contains('Оформить заказ').click();
      cy.wait('@postOrder');

      cy.get('[class*="modal"] button').first().click();

      cy.get('[class*="modal"]').should('not.exist');
      cy.contains('Краторная булка N-200i (верх)').should('not.exist');
      cy.contains('Биокотлета из марсианской Магнолии').should('not.exist');
    });
  });
});
