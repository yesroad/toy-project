interface IHeader {
  title: string;
  description?: string;
}

const Header = ({ title, description }: IHeader) => {
  return (
    <header className="mb-5">
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <span className="block text-sm leading-none font-medium text-gray-500 mt-[5px]">{description}</span>
    </header>
  )
}

export default Header;