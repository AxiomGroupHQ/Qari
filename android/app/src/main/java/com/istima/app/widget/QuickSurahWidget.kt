package com.istima.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.istima.app.R

/**
 * Home screen shortcuts to a few surahs and the mushaf.
 * It only opens the app through deep links, so it holds no state, runs no
 * service and never touches the audio player.
 */
class QuickSurahWidget : AppWidgetProvider() {

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    for (id in appWidgetIds) {
      val views = RemoteViews(context.packageName, R.layout.widget_quick_surah)
      bind(context, views, R.id.widget_fatiha, "istima://quran/1", 1)
      bind(context, views, R.id.widget_yasin, "istima://quran/36", 2)
      bind(context, views, R.id.widget_mulk, "istima://quran/67", 3)
      bind(context, views, R.id.widget_kahf, "istima://quran/18", 4)
      bind(context, views, R.id.widget_mushaf, "istima://mushaf/1", 5)
      appWidgetManager.updateAppWidget(id, views)
    }
  }

  private fun bind(context: Context, views: RemoteViews, viewId: Int, link: String, code: Int) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link)).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    val pending = PendingIntent.getActivity(
      context,
      code,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    views.setOnClickPendingIntent(viewId, pending)
  }
}
