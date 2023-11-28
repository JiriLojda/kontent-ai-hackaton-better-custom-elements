type Props = Readonly<{
  children: string;
  onClick: () => void;
}>;

export const Button = (props: Props) => (
  <button
    type="button"
    className="text-kontent-orange hover:text-white border border-kontent-orange hover:bg-kontent-orange-light focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-3xl text-sm px-5 py-2.5 text-center me-2 mb-2"
    onClick={props.onClick}
  >
    {props.children}
  </button>
);
