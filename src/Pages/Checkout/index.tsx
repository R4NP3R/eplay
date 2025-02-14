import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import InputMask from 'react-input-mask'

import Button from '../../components/Button'
import Card from '../../components/Card'

import { RootReducer } from '../../store'
import { usePurchaseMutation } from '../../services/api'
import { clear } from '../../store/reducers/cart'

import barCode from '../../assets/images/boleto.png'
import creditCard from '../../assets/images/cartao.png'

import * as S from './styles'
import { getTotalPrice, parseToBrl } from '../../utils'

type Installments = {
  quantity: number
  amount: number
  formattedAmount: string
}

const Checkout = () => {
  const [payWithCard, setPayWithCard] = useState(false)
  const [purchase, { data, isSuccess, isLoading }] = usePurchaseMutation()
  const { items } = useSelector((state: RootReducer) => state.cart)
  const [installments, setInstallments] = useState<Installments[]>([])

  const dispatch = useDispatch()

  const form = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      cpf: '',
      deliveryEmail: '',
      confirmDeliveryEmail: '',
      cardOwner: '',
      cpfCardOwner: '',
      cardDisplayName: '',
      cardNumber: '',
      expiresMonth: '',
      expiresYear: '',
      cardCode: '',
      installments: 1
    },
    validationSchema: yup.object({
      fullName: yup
        .string()
        .min(5, 'O nome precisa ter pelomenos 5 caracteres')
        .required('O campo é obrigatório'),
      email: yup
        .string()
        .email('E-mail inválido')
        .required('O campo é obrigatório'),
      deliveryEmail: yup
        .string()
        .email('E-mail inválido')
        .required('O campo é obrigatório'),
      confirmDeliveryEmail: yup
        .string()
        .oneOf([yup.ref('deliveryEmail')], 'Os E-mails são diferentes')
        .required('O Campo é obrigatório'),
      cpf: yup
        .string()
        .min(14, 'O campo Precisa ter 14 caracteres')
        .max(14, 'O campo Precisa ter 14 caracteres')
        .required('O campo é obrigatório'),

      cardOwner: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      cpfCardOwner: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      cardDisplayName: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      cardNumber: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      expiresMonth: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      expiresYear: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      cardCode: yup
        .string()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        ),
      installments: yup
        .number()
        .when((values, schema) =>
          payWithCard ? schema.required('O campo é obrigatório') : schema
        )
    }),
    onSubmit: (values) => {
      purchase({
        billing: {
          document: values.cpf,
          email: values.email,
          name: values.fullName
        },
        delivery: {
          email: values.deliveryEmail
        },
        payment: {
          installments: values.installments,
          card: {
            active: payWithCard,
            code: Number(values.cardCode),
            name: values.cardDisplayName,
            number: values.cardNumber,
            owner: {
              name: values.cardOwner,
              document: values.cpfCardOwner
            },
            expires: {
              month: Number(values.expiresMonth),
              year: Number(values.expiresYear)
            }
          }
        },
        products: items.map((items) => ({
          id: items.id,
          price: items.prices.current as number
        }))
      })
    }
  })
  const totalPrice = getTotalPrice(items)

  const checkInputHasError = (fieldName: string) => {
    const isInvalid = fieldName in form.errors
    const isTouched = fieldName in form.touched
    const hasError = isInvalid && isTouched

    return hasError
  }

  useEffect(() => {
    const calculateInstallments = () => {
      const installmentsArray: Installments[] = []

      for (let i = 1; i <= 6; i++) {
        installmentsArray.push({
          quantity: i,
          amount: totalPrice / i,
          formattedAmount: parseToBrl(totalPrice / i)
        })
      }

      return installmentsArray
    }

    setInstallments(calculateInstallments())
  }, [totalPrice])

  useEffect(() => {
    if (isSuccess) {
      dispatch(clear())
    }
  }, [isSuccess, dispatch])

  if (items.length === 0 && !isSuccess) {
    return <Navigate to="/" />
  }

  return (
    <div className="container">
      {isSuccess && data ? (
        <Card title="Muito obrigado">
          <div>
            <p>
              É com satisfação que informamos que recebemos seu pedido com
              sucesso! <br /> Abaixo estão os detalhes da sua compra: <br />
              Número do pedido: {data.orderId} <br />
              Forma de pagamento:{' '}
              {payWithCard ? 'Cartão de crédito' : 'Boleto Bancário'}
            </p>
            <p className="margin-top">
              Caso tenha optado pelo pagamento via boleto bancário, lembre-se de
              que a confirmação pode levar até 3 dias úteis. Após a aprovação do
              pagamento, enviaremos um e-mail contendo o código de ativação do
              jogo.
            </p>
            <p className="margin-top">
              Se você optou pelo pagamento com cartão de crédito, a liberação do
              código de ativação ocorrerá após a aprovação da transação pela
              operadora do cartão. Você receberá o código no e-mail cadastrado
              em nossa loja.
            </p>
            <p className="margin-top">
              Pedimos que verifique sua caixa de entrada e a pasta de spam para
              garantir que receba nossa comunicação. Caso tenha alguma dúvida ou
              necessite de mais informações, por favor, entre em contato conosco
              através dos nossos canais de atendimento ao cliente.
            </p>
            <p className="margin-top">
              Agradecemos por escolher a EPLAY e esperamos que desfrute do seu
              jogo!
            </p>
          </div>
        </Card>
      ) : (
        <form onSubmit={form.handleSubmit}>
          <Card title="Dados de cobrança">
            <>
              <S.Row>
                <S.InputGroup>
                  <label htmlFor="fullName">Nome Completo</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={form.values.fullName}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={checkInputHasError('fullName') ? 'error' : ''}
                  />
                </S.InputGroup>
                <S.InputGroup>
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.values.email}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={checkInputHasError('email') ? 'error' : ''}
                  />
                </S.InputGroup>
                <S.InputGroup>
                  <label htmlFor="cpf">CPF</label>
                  <InputMask
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={form.values.cpf}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={checkInputHasError('cpf') ? 'error' : ''}
                    mask="999.999.999-99"
                  />
                </S.InputGroup>
              </S.Row>
              <h3 className="margin-top">
                Dados de Entrega - conteúdo digital
              </h3>
              <S.Row>
                <S.InputGroup>
                  <label htmlFor="deliveryEmail">E-mail</label>
                  <input
                    type="email"
                    id="deliveryEmail"
                    name="deliveryEmail"
                    value={form.values.deliveryEmail}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={
                      checkInputHasError('deliveryEmail') ? 'error' : ''
                    }
                  />
                </S.InputGroup>
                <S.InputGroup>
                  <label htmlFor="confirmDeliveryEmail">
                    Confirme o E-mail
                  </label>
                  <input
                    type="email"
                    id="confirmDeliveryEmail"
                    name="confirmDeliveryEmail"
                    value={form.values.confirmDeliveryEmail}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={
                      checkInputHasError('confirmDeliveryEmail') ? 'error' : ''
                    }
                  />
                </S.InputGroup>
              </S.Row>
            </>
          </Card>
          <Card title="Pagamento">
            <div>
              <S.TabButton
                onClick={() => setPayWithCard(false)}
                isActive={!payWithCard}
                type="button"
              >
                <img src={barCode} alt="Boleto" />
                Boleto Bancario
              </S.TabButton>
              <S.TabButton
                onClick={() => setPayWithCard(true)}
                isActive={payWithCard}
                type="button"
              >
                <img src={creditCard} alt="Cartao de crédito" />
                Cartao de crédito
              </S.TabButton>
              <div className="margin-top">
                {payWithCard ? (
                  <>
                    <>
                      <S.Row>
                        <S.InputGroup>
                          <label htmlFor="cardOwner">
                            Nome do titular do cartão
                          </label>
                          <input
                            type="text"
                            id="cardOwner"
                            name="cardOwner"
                            value={form.values.cardOwner}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('cardOwner') ? 'error' : ''
                            }
                          />
                        </S.InputGroup>
                        <S.InputGroup>
                          <label htmlFor="cpfCardOwner">
                            CPF do titular do cartão
                          </label>
                          <InputMask
                            type="text"
                            id="cpfCardOwner"
                            name="cpfCardOwner"
                            value={form.values.cpfCardOwner}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('cpfCardOwner') ? 'error' : ''
                            }
                            mask="999.999.999-99"
                          />
                        </S.InputGroup>
                      </S.Row>
                      <S.Row marginTop="24px">
                        <S.InputGroup>
                          <label htmlFor="cardDisplayName">
                            Nome no cartão
                          </label>
                          <input
                            type="text"
                            id="cardDisplayName"
                            name="cardDisplayName"
                            value={form.values.cardDisplayName}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('cardDisplayName')
                                ? 'error'
                                : ''
                            }
                          />
                        </S.InputGroup>
                        <S.InputGroup>
                          <label htmlFor="cardNumber">Número do cartão</label>
                          <InputMask
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={form.values.cardNumber}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('cardNumber') ? 'error' : ''
                            }
                            mask="9999 9999 9999 9999"
                          />
                        </S.InputGroup>
                        <S.InputGroup maxWidth="123px">
                          <label htmlFor="expiresMonth">Mês do expiração</label>
                          <InputMask
                            type="text"
                            id="expiresMonth"
                            name="expiresMonth"
                            value={form.values.expiresMonth}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('expiresMonth') ? 'error' : ''
                            }
                            mask="99"
                          />
                        </S.InputGroup>
                        <S.InputGroup maxWidth="123px">
                          <label htmlFor="expiresYear">Ano de expiração</label>
                          <InputMask
                            type="text"
                            id="expiresYear"
                            name="expiresYear"
                            value={form.values.expiresYear}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('expiresYear') ? 'error' : ''
                            }
                            mask="99"
                          />
                        </S.InputGroup>
                        <S.InputGroup maxWidth="48px">
                          <label htmlFor="cardCode">CVV</label>
                          <InputMask
                            type="text"
                            id="cardCode"
                            name="cardCode"
                            value={form.values.cardCode}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('cardCode') ? 'error' : ''
                            }
                            mask="999"
                          />
                        </S.InputGroup>
                      </S.Row>
                      <S.Row marginTop="24px">
                        <S.InputGroup maxWidth="135px">
                          <label htmlFor="installments">Parcelamento</label>
                          <select
                            id="installments"
                            name="installments"
                            value={form.values.installments}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            className={
                              checkInputHasError('installments') ? 'error' : ''
                            }
                          >
                            {installments.map((installments) => (
                              <option
                                value={installments.quantity}
                                key={installments.quantity}
                              >
                                {installments.quantity}x de{' '}
                                {installments.formattedAmount}
                              </option>
                            ))}
                          </select>
                        </S.InputGroup>
                      </S.Row>
                    </>
                  </>
                ) : (
                  <>
                    <p>
                      Ao optar por essa forma de pagamento, é importante lembrar
                      que a confirmação pode levar até 3 dias úteis, devido aos
                      prazos estabelecidos pelas instituições financeiras.
                      Portanto, a liberação do código de ativação do jogo
                      adquirido ocorrerá somente após a aprovação do pagamento
                      do boleto.
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
          <Button
            type="submit"
            title="Clique aqui para finalizar a compra"
            variant="primary"
            onClick={form.handleSubmit}
          >
            {isLoading ? 'Finalizando compra...' : 'Finalizar compra'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default Checkout
