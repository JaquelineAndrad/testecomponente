import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})

Cypress.Commands.add('fillCardForm', (card) => {
  cy.get('[data-cy="number"]').type(card.number)
  cy.get('[data-cy="holderName"]').type(card.holderName)
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate)
  cy.get('[data-cy="cvv"]').type(card.cvv)
  cy.get('[data-cy="bank-neon"] > .font-medium').click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click()
})


describe('<AddCard />', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })

  it('exibe erros quando os campos não são informados', () => {
    cy.submitCardForm()

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })
  })

  it('Deve cadastrar um novo cartão com sucesso', () => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)

    const myCard = {
      number: '4242424242424242',
      holderName: 'Jaqueline Andrade',
      expirationDate: '12/35',
      cvv: '123',
      bank: 'Neon'
    }

    cy.intercept('POST', 'http://wallet.cardify.dev/api/cards', {
      statusCode: 201,
      body: myCard
    }).as('addCard')
    cy.submitCardForm()

    cy.fillCardForm(myCard)
   
    cy.get('[data-cy="bank-neon"] > .w-16 > .w-full')
      .click()
    cy.wait('@addCard')
    cy.get('.notice-success')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso')
  })

it('Valida nome do titular com menos de dois caracteres', () => {
   

    const myCard = {
      number: '4242424242424242',
      holderName: 'J',
      expirationDate: '12/35',
      cvv: '123',
      bank: 'Neon'
    }

    cy.fillCardForm(myCard)
    cy.get('[data-cy="saveMyCard"]')
      .click()
    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')

  })

it('Valida data de expiração inválida ', () => {


    const myCard = {
      number: '4242424242424242',
      holderName: 'Jaqueline Andrade',
      expirationDate: '13/35',
      cvv: '123',
      bank: 'Neon'
    }

    cy.fillCardForm(myCard)
    cy.submitCardForm()
    cy.alertErrorHaveText('Data de expiração inválida ou vencida')

  })  

it('Valida cvv com emnos de três digitos ', () => {
  

    const myCard = {
      number: '4242424242424242',
      holderName: 'Jaqueline Andrade',
      expirationDate: '12/35',
      cvv: '1',
      bank: 'Neon'
    }

    cy.fillCardForm(myCard)
    cy.submitCardForm()
    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')

  })


})//