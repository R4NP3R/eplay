import * as S from './styles'
import Logo from '../../assets/images/logo.svg'
import cartIcon from '../../assets/images/carrinho.svg'
import { HashLink } from 'react-router-hash-link'
import { open } from '../../store/reducers/cart'
import { useDispatch, useSelector } from 'react-redux'
import { RootReducer } from '../../store'
import { useState } from 'react'

const Header = () => {
  const dispatch = useDispatch()

  const { items } = useSelector((state: RootReducer) => state.cart)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const openCart = () => {
    dispatch(open())
  }

  return (
    <S.HeaderBar>
      <S.HeaderRow>
        <div>
          <S.Hamburguer onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span />
            <span />
            <span />
          </S.Hamburguer>
          <HashLink to="/">
            <h1>
              <img src={Logo} alt="EPLAY" />
            </h1>
          </HashLink>
          <nav>
            <S.Links>
              <S.LinkItem>
                <HashLink
                  to="/categories"
                  title="Clique aqui para acessar a página de categorias"
                >
                  Categorias
                </HashLink>
              </S.LinkItem>
              <S.LinkItem>
                <HashLink
                  to="/#coming-soon"
                  title="Clique aqui para acessar a página de em breve"
                >
                  Em breve
                </HashLink>
              </S.LinkItem>
              <S.LinkItem>
                <HashLink
                  to="/#on-sale"
                  title="Clique aqui para acessar a página de promoções"
                >
                  Promoções
                </HashLink>
              </S.LinkItem>
            </S.Links>
          </nav>
        </div>
        <S.CartButton role="button" onClick={openCart}>
          {items.length}
          <span>- Produto(s)</span>
          <img src={cartIcon} alt="Carrinho" />
        </S.CartButton>
      </S.HeaderRow>
      <S.NavMobile className={isMenuOpen ? 'isOpen' : ''}>
        <S.Links>
          <S.LinkItem>
            <HashLink
              to="/categories"
              title="Clique aqui para acessar a página de categorias"
              onClick={() => setIsMenuOpen(false)}
            >
              Categorias
            </HashLink>
          </S.LinkItem>
          <S.LinkItem>
            <HashLink
              to="/#coming-soon"
              title="Clique aqui para acessar a página de em breve"
              onClick={() => setIsMenuOpen(false)}
            >
              Em breve
            </HashLink>
          </S.LinkItem>
          <S.LinkItem>
            <HashLink
              to="/#on-sale"
              title="Clique aqui para acessar a página de promoções"
              onClick={() => setIsMenuOpen(false)}
            >
              Promoções
            </HashLink>
          </S.LinkItem>
        </S.Links>
      </S.NavMobile>
    </S.HeaderBar>
  )
}

export default Header
