import {Anchor} from '@mantine/core'
import {Link} from 'react-router-dom'

interface IOTIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    size?: number | string
}

export function LZIcon({size, style}: IOTIconProps) {
    return (
        <Anchor component={Link} to='/'>
            <svg
                height={size}
                strokeMiterlimit='10'
                style={style}
                version='1.1'
                viewBox='0 0 1024 1024'
                width={size}
                xmlSpace='preserve'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
            >
                <defs>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient'
                        x1='279.277'
                        x2='530.833'
                        y1='509.377'
                        y2='509.377'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_2'
                        x1='462.44'
                        x2='625.57'
                        y1='474.329'
                        y2='474.329'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_3'
                        x1='148.703'
                        x2='314.177'
                        y1='691.367'
                        y2='691.367'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_4'
                        x1='557.591'
                        x2='775.331'
                        y1='369.313'
                        y2='369.313'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_5'
                        x1='581.048'
                        x2='830.356'
                        y1='369.131'
                        y2='369.131'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_6'
                        x1='569.725'
                        x2='854.417'
                        y1='598.228'
                        y2='598.228'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                    <linearGradient
                        gradientTransform='matrix(1 0 0 1 0 0)'
                        gradientUnits='userSpaceOnUse'
                        id='LinearGradient_7'
                        x1='512.933'
                        x2='537.718'
                        y1='265.109'
                        y2='265.109'
                    >
                        <stop offset='0' stopColor='#000000' />
                        <stop offset='1' stopColor='#000000' />
                    </linearGradient>
                </defs>
                <g id='Слой-2'>
                    <path
                        d='M504.749 299.67L279.277 704.565L305.361 719.085L530.833 314.189L504.749 299.67Z'
                        fill='url(#LinearGradient)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M558.048 698.746L462.44 375.921L528.715 249.913L625.57 579.159L558.048 698.746Z'
                        fill='url(#LinearGradient_2)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M231.414 627.299C186.568 627.299 148.703 654.736 148.703 691.341C148.703 727.947 186.568 755.436 231.414 755.436C276.26 755.436 314.177 727.947 314.177 691.341C314.177 654.736 276.26 627.299 231.414 627.299Z'
                        fill='url(#LinearGradient_3)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M569.634 279.705L672.712 279.705L557.591 488.79L741.459 488.422L775.331 458.308L607.979 458.308L723.272 249.836L559.822 249.836L569.634 279.705Z'
                        fill='url(#LinearGradient_4)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M830.356 249.421L679.765 249.887L679.868 279.757L780.366 279.446L686.572 458.119L581.048 458.119L584.66 488.842L702.219 488.375L830.356 249.421Z'
                        fill='url(#LinearGradient_5)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M854.417 458.558L775.201 458.289L774.921 458.288L724.849 458.308L569.725 738.168L700.663 738.168L854.417 458.558ZM804.285 488.742L682.98 708.298L620.752 708.298C641.26 671.781 735.511 502.964 743.498 488.742L804.285 488.742Z'
                        fill='url(#LinearGradient_6)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                    <path
                        d='M528.513 250.174L537.718 280.043L531.397 280.043L512.933 279.99L528.513 250.174Z'
                        fill='url(#LinearGradient_7)'
                        fillRule='nonzero'
                        opacity='1'
                        stroke='none'
                    />
                </g>
            </svg>
        </Anchor>
    )
}
