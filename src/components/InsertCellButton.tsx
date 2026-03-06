import React from "react";

interface Props {
    tabId: number;
    positionBefore: number | null;
    positionAfter: number | null;
    onInsert: (position: number, cellType: number) => void;
}

const InsertCellButton: React.FC<Props> = React.memo(
    ({ positionBefore, positionAfter, onInsert }) => {
        const [visible, setVisible] = React.useState(false);

        const calcPosition = React.useCallback(() => {
            if (positionBefore === null && positionAfter !== null) {
                return Math.floor(positionAfter / 2);
            } else if (positionBefore !== null && positionAfter === null) {
                return positionBefore + 1000;
            } else if (positionBefore !== null && positionAfter !== null) {
                return Math.floor((positionBefore + positionAfter) / 2);
            }
            return 1000;
        }, [positionBefore, positionAfter]);

        const handleMarkdown = React.useCallback(() => {
            onInsert(calcPosition(), 0);
        }, [calcPosition, onInsert]);

        const handleImage = React.useCallback(() => {
            onInsert(calcPosition(), 1);
        }, [calcPosition, onInsert]);

        return (
            <div
                className="insert-zone"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
            >
                <div className={`insert-line${visible ? " insert-line--visible" : ""}`}>
                    <div className={`insert-btns${visible ? " insert-btns--visible" : ""}`}>
                        <button
                            className="insert-btn insert-btn--md"
                            onClick={handleMarkdown}
                            title="Inserir Markdown"
                        >
                            MD
                        </button>
                        <button
                            className="insert-btn insert-btn--img"
                            onClick={handleImage}
                            title="Inserir Imagem"
                        >
                            IMG
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

InsertCellButton.displayName = "InsertCellButton";
export default InsertCellButton;
