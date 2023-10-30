import { Button, Container } from "@medusajs/ui";
import { MostSoldProduct } from "../../../../../services/micro-analytics";
import clsx from "clsx";

type Props = {
  title: string;
  product: MostSoldProduct | null;
};

const MostSoldedProductCard = ({ title, product }: Props) => {
  return (
    <Container
      className={clsx(
        "flex flex-col gap-y-1.5 p-8 max-w-[20rem] w-full",
        !product && "opacity-75"
      )}
    >
      {!product && (
        <div className=" w-full h-full flex flex-col gap-y-4">
          <p className="text-lg capitalize text-grey-90 font-medium">{title}</p>
          <div className="w-full aspect-square bg-grey-20 rounded"></div>
          <div className="grid gap-y-2">
            <p className="font-medium text-grey-70">N/A</p>
            <p className="text-sm text-grey-50">No product found.</p>
          </div>
        </div>
      )}
      {!!product && (
        <div className=" w-full h-full flex flex-col gap-y-4">
          <p className="text-lg capitalize text-grey-70 font-medium">{title}</p>
          <div className="w-full aspect-square bg-grey-20 rounded"></div>
          <div className="grid gap-y-2">
            <p className="font-medium text-grey-70">{product.title}</p>
            <p className="text-sm text-grey-50">
              <b className="text-grey-70">{product.quantity}</b> sold
            </p>
          </div>
          <div className="flex w-full justify-end">
            <a href={`/a/products/${product.id}`}>
              <Button size="base" variant="secondary">
                Show product
              </Button>
            </a>
          </div>
        </div>
      )}
      {/* <div className="flex flex-col gap-y-1.5">
        <p className="text-lg capitalize text-grey-70 font-medium">{title}</p>
        {!product && (
          <>
            <div className="w-full h-full rounded overflow-hidden max-w-[14rem] aspect-square bg-grey-40"></div>
            <div className="grid mt-2">
              <p className="text-grey-70 text-xl">N/A</p>
              <p className="text-grey-50">No product found.</p>
            </div>
          </>
        )}

        {!!product && (
          <>
            <div className="w-full h-full rounded overflow-hidden max-w-[14rem] aspect-square">
              <img src={product.thumbnail} alt={product.title} />
            </div>
            <div className="grid mt-2">
              <div>
                <p className="text-grey-70 text-xl">{product.title}</p>
                <p className="text-grey-50">
                  <b className="text-grey-70">{product.quantity}</b> sold
                </p>
              </div>
              <a href={`/products/${product.id}`}>
                <Button>Show product</Button>
              </a>
            </div>
          </>
        )}
      </div> */}
    </Container>
  );
};

export default MostSoldedProductCard;
