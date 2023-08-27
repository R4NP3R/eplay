import Tag from '../Tag'
import Button from '../Button'
import Loader from '../Loader'

import { parseToBrl } from '../../utils'
import { useGetFeaturedGamesQuery } from '../../services/api'

import * as S from './styles'

const Banner = () => {
  const { data: game } = useGetFeaturedGamesQuery()

  if (!game) {
    return <Loader />
  }

  return (
    <S.Image style={{ backgroundImage: `url(${game.media.cover})` }}>
      <div className="container">
        <Tag size="big">Destaque do dia</Tag>
        <div>
          <S.Title>{game.name}</S.Title>
          <S.Title>
            De <span>{parseToBrl(game.prices.old)}</span>
            <br />
            por apenas {parseToBrl(game.prices.current)}
          </S.Title>
        </div>
        <Button
          to={`/product/${game.id}`}
          type="link"
          title="Clique aqui para receber esta oferta!"
        >
          Aproveitar
        </Button>
      </div>
    </S.Image>
  )
}
export default Banner
