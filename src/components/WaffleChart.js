import { ResponsiveWaffle } from '@nivo/waffle'

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const WaffleChart = ({ data /* see data tab */ }) => (
    <ResponsiveWaffle
        data={data}
        total={100}
        rows={18}
        columns={14}
        padding={1}
        valueFormat=".2f"
        margin={{ top: 10, right: 10, bottom: 10, left: 120 }}
        colors={{ scheme: 'nivo' }}
        borderRadius={3}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.3
                ]
            ]
        }}
        motionStagger={2}
        legends={[
            {
                anchor: 'top-left',
                direction: 'column',
                justify: false,
                translateX: -100,
                translateY: 0,
                itemsSpacing: 4,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                itemTextColor: '#777',
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000',
                            itemBackground: '#f7fafb'
                        }
                    }
                ]
            }
        ]}
    />
)

export default WaffleChart;