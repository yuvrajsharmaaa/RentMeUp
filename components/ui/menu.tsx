import { Menu as ChakraMenu } from "@chakra-ui/react"
import * as React from "react"

export interface MenuContentProps extends ChakraMenu.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props
    return (
      <ChakraMenu.Positioner>
        <ChakraMenu.Content ref={ref} {...rest} />
      </ChakraMenu.Positioner>
    )
  },
)

export const MenuRoot = ChakraMenu.Root
export const MenuTrigger = ChakraMenu.Trigger
export const MenuItem = ChakraMenu.Item
export const MenuItemGroup = ChakraMenu.ItemGroup
export const MenuSeparator = ChakraMenu.Separator
