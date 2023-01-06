import { Component, Inject, NgZone, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
// import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute, Params } from '@angular/router';


import { Data } from '../../../core/models/data.models';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5stock from "@amcharts/amcharts5/stock";


@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

  private root!: am5.Root;
  datas: Data[] = [];
  deviceId: number = 1;

  constructor(@Inject(PLATFORM_ID)
  private platformId: Object,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.activatedRoute.snapshot.params['id'];
    this.activatedRoute.params.subscribe((params: Params) => {
      this.deviceId = params['id'];
      //request data from service
      this.getData(this.deviceId);
    },
      (error) => {
        console.log(error);
      }
    );
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  getData(id: number) {
    this.dataService.fullDataByDeviceId(id).subscribe(datos => {
      this.createMap(datos, "linechartdiv")
    });
  }

  maybeDisposeRoot(divId) {
    am5.array.each(am5.registry.rootElements, function (root) {
      if (root.dom.id == divId) {
        root.dispose();
      }
    });
  }

  createMap(apiData: Data[], divId) {
    // Chart code goes in here
    this.browserOnly(() => {

      // Dispose previously created Root element
      this.maybeDisposeRoot(divId);
      /* Chart code */
      // Create root element
      // https://www.amcharts.com/docs/v5/getting-started/#Root_element
      let root = am5.Root.new(divId);
      // Set themes
      // https://www.amcharts.com/docs/v5/concepts/themes/
      root.setThemes([
        am5themes_Animated.new(root),
        // am5themes_Dark.new(root)
      ]);
      // Create a stock chart
      // https://www.amcharts.com/docs/v5/charts/stock-chart/#Instantiating_the_chart
      let stockChart = root.container.children.push(am5stock.StockChart.new(root, {})
      );

      // Create a main stock panel (chart)
      // https://www.amcharts.com/docs/v5/charts/stock-chart/#Adding_panels
      let mainPanel = stockChart.panels.push(am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: false
      }));

      // Create axes
      // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
      let valueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      }));

      let dateAxis = mainPanel.xAxes.push(am5xy.DateAxis.new(root, {
        baseInterval: {
          timeUnit: "minute",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      }));

      mainPanel.set("cursor", am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        behavior: "zoomX"
      }));

      function dataLoaded(result) {
        // Set data on all series of the chart
        valueSeries.data.processor = am5.DataProcessor.new(root, {
          numericFields: ["dataHum1", "cc", "ur"],
          dateFields: ["dataFecha"],
          dateFormat: "yyyy-MM-dd HH:mm:ss"
        });
        valueSeries.data.setAll(result);
        console.log(result);
      }

      let valueSeries = mainPanel.series.push(am5xy.LineSeries.new(root, {
        name: "Humedad",
        valueXField: "dataFecha",
        valueYField: "dataHum1",
        xAxis: dateAxis,
        yAxis: valueAxis,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}%"
        })
      }));

      // add series range
      let optimoRangeDataItem = valueAxis.makeDataItem({ value: 27, endValue: 23.5 });
      let optimoRange = valueSeries.createAxisRange(optimoRangeDataItem);
      // optimoRange.fills.template.setAll({
      //   visible: true,
      //   opacity: 0.5
      // });

      // optimoRange.fills.template.set("fill", am5.color("#b5f5d0"));
      // optimoRange.strokes.template.set("stroke", am5.color("#14b349"));

      // optimoRangeDataItem.get("grid").setAll({
      //   strokeOpacity: 1,
      //   visible: true,
      //   stroke: am5.color("#04b530"),
      //   strokeDasharray: [2, 2]
      // })

      optimoRangeDataItem.get("axisFill").setAll({
        fill: am5.color("#4eed90"),
        fillOpacity: 0.2,
        visible: true
      });

      optimoRangeDataItem.get("label").setAll({
        inside: true,
        fill: am5.color(0xffffff),
        text: "WC",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color("#668f64")
        }),
        location: 0,
        visible: true,
        // text: "CC",
        
        centerX: 0,
        centerY: am5.p100,
        fontWeight: "bold"
      })

      // add caution range
      let cautionRangeDataItem = valueAxis.makeDataItem({ value: 23.5, endValue: 21 });
      let cautionRange = valueSeries.createAxisRange(cautionRangeDataItem);
      //  cautionRange.fills.template.setAll({
      //    visible: true,
      //    opacity: 0.5
      //  });

      //  cautionRangeDataItem.get("grid").setAll({
      //    strokeOpacity: 1,
      //    visible: true,
      //    stroke: am5.color("#d9db42"),
      //    strokeDasharray: [2, 2]
      //  })

      cautionRangeDataItem.get("axisFill").setAll({
        fill: am5.color("#edf059"),
        fillOpacity: 0.2,
        visible: true
      });

      cautionRangeDataItem.get("label").setAll({
        location: 0,
        visible: true,
        text: "AFD",
        inside: true,
        centerX: 0,
        centerY: am5.p100,
        fontWeight: "bold"
      })

      // add ur series range
      let urRangeDataItem = valueAxis.makeDataItem({ value: 21, endValue: 0 });
      let urRange = valueSeries.createAxisRange(urRangeDataItem);
      // urRange.fills.template.setAll({
      //   visible: true,
      //   opacity: 0.5
      // });

      urRange.strokes.template.set("stroke", am5.color("#f50a45"));

      // urRangeDataItem.get("grid").setAll({
      //   strokeOpacity: 1,
      //   visible: true,
      //   stroke: am5.color("#f50a45"),
      //   strokeDasharray: [2, 2]
      // })

      urRangeDataItem.get("axisFill").setAll({
        fill: am5.color("#fa64af"),
        fillOpacity: 0.1,
        visible: true
      });

      urRangeDataItem.get("label").setAll({
        location: 0,
        visible: true,
        text: "UR",
        inside: true,
        centerX: 0,
        centerY: am5.p100,
        fontWeight: "bold"
      })

      // Add scrollbar
      // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
      mainPanel.set("scrollbarX", am5.Scrollbar.new(root, {
        orientation: "horizontal"
      }));

      // Add toolbar
      // https://www.amcharts.com/docs/v5/charts/stock/toolbar/
      am5stock.StockToolbar.new(root, {
        container: document.getElementById("chartcontrols"),
        stockChart: stockChart,
        controls: [
          am5stock.DateRangeSelector.new(root, {
            stockChart: stockChart
          }),
          am5stock.PeriodSelector.new(root, {
            stockChart: stockChart
          })
        ]
      });

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      valueSeries.appear(1000);
      mainPanel.appear(1000, 100);

      dataLoaded(apiData);
    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }

}
