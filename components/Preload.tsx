import { useEffect, useState } from "react"
import useWindowDimensions from "@/components/WindowDimensions";

type PreloadType = {
    length?: number
    search?: boolean
}

const MOVIE_LENGTH_DESKTOP = 18
const MOVIE_LENGTH = 20
const SEARCH_MOVIE_LENGTH = 12

export const PreloadMovie = ({ length, search = false }: PreloadType) => {
    const { width } = useWindowDimensions()
    const safeLength = search === true ? SEARCH_MOVIE_LENGTH: MOVIE_LENGTH_DESKTOP
    const [movieLength, setMovieLength] = useState(length || (safeLength));

    useEffect(() => {
        width && width > 1536 ? setMovieLength(safeLength) : setMovieLength(search === true ? SEARCH_MOVIE_LENGTH: MOVIE_LENGTH)
      }, [width])

    return (
        <>
        {Array.from({ length: length || movieLength }, (_, index) => (
          <div 
            key={index} 
            className="relative flex flex-col rounded-md bg-dark-200 shadow-md duration-300 hover:shadow-xl h-full overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-dark-100/10 before:to-transparent pb-1"
            >
            <div 
                className="flex h-[14rem] items-center justify-center overflow-hidden rounded-t-md lg:h-[16rem] 2xl:h-[17rem] bg-dark-150"
            >
                <svg className="w-16 h-16 text-dark-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                    <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                </svg>    
            </div>    

            <div className="p-2 pb-1 flex flex-col justify-between h-[8rem]">
                <div>
                    <div className="h-4 bg-dark-150 rounded-full w-1/5 mb-2.5 bg-opacity-75"/>
                    <div className="h-6 bg-dark-150 rounded-full w-4/6 mb-2.5"/>
                </div>
                <div className="h-10 bg-dark-150 rounded-md w-full py-2 bg-opacity"/>
            </div>
            
            
          </div>
        ))}
        </>
    )    
}